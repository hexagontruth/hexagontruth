import HookSet from './hook-set.js';
import PlayerFactory from './player-factory.js';
import config from '../config.js';
import redirectDefs from '../redirect-defs.js';
import videoDefs from '../video-defs.js';

export default class Page {
  constructor() {
    this.loaded = false;
    this.scrollTabs = [];
    this.scrollMap = {};
    this.letterTimer = null;
    this.letterInterval = 150;
    this.titleHidden = false;
    this.counter = 0;

    this.setEnv();
    this.setArgs();

    window.addEventListener('load', (ev) => this.onLoad(ev));

    setTimeout(() => this.onLoad(), 1000);
  }

  setArgs() {
    let query = window.location.search.replace('?', '') || '';

    let argPairs = query.split('&').filter((e) => e != '').map((e) => e.split('='));
    this.args = {};
    for (let [k, v] of argPairs) {
      this.args[k] = v !== undefined ? v : true;
    }

    Object.entries(redirectDefs).forEach(([k, v]) => {
      if (this.args[k]) {
        window.location.href = v;
      }
    });
  }

  setEnv() {
    this.isProduction = window.location.host == config.productionHost;
    this.env = this.isProduction ? 'production' : 'development';
    this.mediaBaseUrl = config.envs[this.env].mediaBaseUrl;
  }

  onLoad(ev) {
    if (this.loaded) return;
    this.loaded = true;

    this.body = document.body;
    this.page = document.querySelector('#page');
    this.header = document.querySelector('#header');
    this.footer = document.querySelector('#footer');
    this.isProduction && this.onProd();

    this.players = {};
    document.querySelectorAll('.player').forEach((el) => {
      const name = el.getAttribute('data-program');
      const controlsSelector = el.getAttribute('data-controls');
      const controls = document.querySelector(controlsSelector);
      const player = PlayerFactory(this, name, el);
      this.players[name] = player;
    });
    Object.values(this.players).forEach((e) => e.loadCustomTextures());

    this.hooks = new HookSet(['onSnap', 'onScroll'], this);
    this.hooks.add('onSnap', () => {
      if (this.scrollId == 'art') {
        this.startVideo(0);
      }
      else {
        this.hideVideo();
      }
    });

    this.initializeVideo();

    this.controls = document.querySelector('#controls');
    this.counterDisplay = document.querySelector('#counter');
    this.title = document.querySelector('h1');
    this.letters = document.querySelectorAll('h1 span');
    this.hidden = false;
    this.scrollPos = 0;
    this.lastPointer = 0;

    this.page.addEventListener('pointercancel', (ev) => this.handlePointer(ev));
    this.page.addEventListener('pointerdown', (ev) => this.handlePointer(ev));
    this.page.addEventListener('pointermove', (ev) => this.handlePointer(ev));
    this.page.addEventListener('pointerout', (ev) => this.handlePointer(ev));
    this.page.addEventListener('pointerup', (ev) => this.handlePointer(ev));
    window.addEventListener('keydown', (ev) => this.handleKey(ev));
    window.addEventListener('keyup', (ev) => this.handleKey(ev));
    window.addEventListener('resize', (ev) => this.handleResize(ev));
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));

    // This goes against everything I believe in but fuck you Chrome
    if (window.chrome && !navigator.maxTouchPoints) {
      window.addEventListener('wheel', (ev) => this.onWheel(ev), {passive: false});
    }

    this.setScrollBlocks();
    this.setAnchor();
    this.handleScroll();

    this.args.hide && this.toggleHidden();
    this.args.counter && this.toggleControls();

    document.body.style.transition = 'opacity 1000ms';
    document.body.style.opacity = 1;

    this.players.main.start();
  }

  initializeVideo() {
    this.videoDefs = videoDefs.slice();
    this.videos = Array(this.videoDefs.length).fill(null);
    this.videoContainer = document.querySelector('#video-container');
    this.videoLink = Array.from(document.querySelectorAll('.video-link'));
    this.videoPrev = Array.from(document.querySelectorAll('.video-prev'));
    this.videoNext = Array.from(document.querySelectorAll('.video-next'));
    this.videoPrev.forEach((e) => e.addEventListener('click', () => this.startVideo(-1)));
    this.videoNext.forEach((e) => e.addEventListener('click', () => this.startVideo(1)));
    this.videoIdx = 0;
    this.lastVideo = null;
    this.curVideo = null;
  }

  createVideo(src) {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.src = this.mediaBaseUrl + src;
    return video;
  }

  hideVideo() {
    this.videoContainer.classList.add('hidden');
    this.curVideo?.pause();
  }

  startVideo(offset) {
    this.videoIdx = (this.videoIdx + offset + this.videoDefs.length) % this.videoDefs.length;
    this.loadVideo(this.videoIdx);
  }

  loadVideo(idx) {
    if (this.curVideo && this.curVideo == this.videos[idx]) return;
    const videoDef = this.videoDefs[idx];
    let nextVideo = this.videos[idx];
    if (!nextVideo) {
      nextVideo = this.createVideo(videoDef.src);
      nextVideo.oncanplaythrough = () => this.swapVideo(nextVideo, videoDef);
    }
    else {
      this.swapVideo(nextVideo);
    }
  }

  swapVideo(video, videoDef) {
    this.lastVideo?.remove();
    this.lastVideo = this.curVideo;
    this.lastVideo?.pause();

    this.curVideo = video;
    this.videoContainer.appendChild(this.curVideo);
    this.curVideo.play();

    requestAnimationFrame(() => this.lastVideo?.classList.remove('active'));
    requestAnimationFrame(() => this.curVideo.classList.add('active'));
    window.setTimeout(() => this.videoContainer.classList.remove('hidden'), 0);

    this.videoLink.forEach((e) => e.href = videoDef.link);
    this.videoLink.forEach((e) => {
      if (this.videoContainer != e) {
        e.innerHTML = videoDef.name;
      }
    });
  }

  updateCounter(count) {
    this.counter = count || this.counter;
    const paddedCount = ('00000' + this.counter).slice(-6);
    this.counterDisplay.innerHTML = paddedCount;
  }

  hideTitle() {
    this.titleHidden = true;
    this.players.logo.hide();
    this.letterTimer && clearTimeout(this.letterTimer);
    this.letters.forEach((e) => e.classList.add('hidden'));
    this.title.className = 't0';
    this.letterIdx = 0;
  }

  animateTitle() {
    this.hideTitle();
    this.players.logo.start();
    this.titleHidden = false;
    this.setTitleTimer();
  }

  setTitleTimer() {
    this.letterTimer && clearTimeout(this.letterTimer);
    this.letterTimer = setTimeout(() => this.animateTitleStep(), this.letterInterval);
  }

  animateTitleStep() {
    this.title.className = `t${this.letterIdx + 1}`
    this.letters[this.letterIdx].classList.remove('hidden');
    if (++this.letterIdx < this.letters.length) {
      this.setTitleTimer();
    }
    else {
      this.title.className = '';
    }
  }

  setAnchor() {
    let [base, fragment] = window.location.href.split('#');
    let idx = this.scrollMap[fragment];
    if (fragment && idx) {
      window.scrollTo(0, this.scrollBlocks[idx].offsetTop);
    }
  }

  createElement(tag='div', className, parent) {
    let element = document.createElement(tag);
    element.className = className || '';
    parent && parent.appendChild(element);
    return element;
  }

  setScrollBlocks(scrollBlocks) {
    const tabTemplate = this.createElement('div', 'scroll-tab');
    this.createElement('div', 'scroll-tab-inner', tabTemplate);

    this.scrollTabGroup = document.querySelector('.scroll-tabs');
    this.scrollBlocks = Array.from(document.querySelectorAll('.scroll-block'));

    if (!this.hasScroll) return;
    
    for (let i = 0; i < this.scrollBlocks.length; i++) {
      const id = this.scrollBlocks[i].id;
      // if (!id) continue;

      const tab = tabTemplate.cloneNode(true);
      this.scrollTabGroup.appendChild(tab);
      this.scrollTabs.push(tab);
      this.scrollMap[id] = i;

      tab.addEventListener('click', () => this.scrollTo(i));
    }
  }

  scrollTo(idx) {
    location.hash = this.scrollBlocks?.[idx].id || '';
    window.scrollTo(0, this.scrollBlocks[idx].offsetTop);
  }

  getScrollId() {
    const entry = Object.entries(this.scrollMap).find(([k, v]) => v == this.snap);
    return entry?.[0] || null;
  }

  setSnap(n) {
    this.snap = n;
    this.scrollId = this.getScrollId();
    let snap = this.getSnapObject();
    snap[window.location.pathname] = n;
    sessionStorage.setItem('snap', JSON.stringify(snap));
    this.hooks.call('onSnap');
  }

  getSnap() {
    let snap = this.getSnapObject();
    this.snap = parseInt(snap[window.location.pathname]) || 0;
    return this.snap;
  }

  getSnapObject() {
    let str = sessionStorage.getItem('snap');
    return str ? JSON.parse(str) : {};
  }

  onProd() {
    // GA stuff
    this.gaScript = document.createElement('script');
    this.body.appendChild(this.gaScript);
    this.gaScript.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MC0FHVSG9W');
      this.gtag = gtag;
    };
    this.gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-MC0FHVSG9W';
  }

  toggleControls(state=undefined) {
    this.controls?.classList.toggle('hidden', state);
  }
  
  toggleHidden(state=!this.hidden) {
    this.hidden = state;
    document.querySelectorAll('.scroll-block, .nav-block').forEach((e) => {
      e.classList.toggle('hidden', this.hidden);
    });
  }

  eq(y, ep=5) {
    return Math.abs(window.scrollY - y) < ep; 
  }

  get hasScroll() {
    return !!this.scrollBlocks?.length;
  }

  handleKey(ev) {
    const number = Number.parseInt(ev.key);
    if (ev.type == 'keydown') {
      if (number && number <= this.scrollBlocks.length) {
        this.scrollTo(number - 1);
      }
      else if (ev.key == 'c') {
        this.toggleControls();
      }
      else if (ev.key == 'Escape') {
        this.toggleHidden();
      }
      else if (ev.key == 'ArrowLeft' || ev.key == 'ArrowRight') {
        if (this.scrollId == 'art') {
          const offset = ev.key == 'ArrowLeft' ? -1 : 1;
          this.startVideo(offset);
        }
      }
    }
    this.players.main?.hooks.call('onKey', ev);
  }

  handlePointer(ev) {
    if (ev.type == 'pointerdown') {
      const {abs, min} = Math;
      const [w, h] = [window.innerWidth, window.innerHeight];
      const last = this.lastPointer;
      const cur = ev.timeStamp;
      this.lastPointer = cur;
      const distToEdge = min(
        abs(w / 2 - abs(ev.pageX % w - w / 2)) / window.innerWidth,
        abs(h / 2 - abs(ev.pageY % h - h / 2)) / window.innerHeight,
      );

      const cond = distToEdge < 0.1 || ev.pointerType == 'mouse';
      // I am getting so fucking sick of default double click speeds
      if (cond && cur - last < 200) {
        this.toggleHidden();
      }
    }
    this.players.main?.hooks.call('onPointer', ev);
    // this.hidden && ev.stopPropagation();
    // this.hidden && ev.preventDefault();
  }

  handleResize(ev) {
    this.snap == 0 && this.animateTitle();
    Object.values(this.players).forEach((e) => e.handleResize(ev));
  }

  handleScroll(ev) {
    if (!this.hasScroll) return;
    this.scrollTabs.forEach((e) => e.classList.remove('active'));
    let cur = this.scrollBlocks.findIndex((e) => this.eq(e.offsetTop, 1));
    if (cur != -1) {
      this.setSnap(cur);
      this.scrollTabs[cur].classList.add('active');
    }
    if (Math.ceil(window.scrollY) >= window.innerHeight) {
      this.titleHidden || this.hideTitle();
    }
    else if (this.eq(0, 1)) {
      this.animateTitle();
    }

    this.scrollPos = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    this.hooks.call('onScroll');
    Object.values(this.players).forEach((e) => e.handleScroll(ev));
  }

  // Why does Chrome scroll snapping suck so badly?
  onWheel(ev) {
    if (!this.hasScroll) return;
    const pts = this.scrollBlocks.map((e) => e.offsetTop);
    const newY = window.scrollY;
    let nextPoint;
    if (ev.deltaY > 0) {
      nextPoint = pts.find((e) => e != pts[this.snap] && e > newY);
    }
    else {
      nextPoint = pts.slice().reverse().find((e) => e != pts[this.snap] && e < newY);
    }
    if (nextPoint != null) {
      window.scrollTo(0, nextPoint, {behavior: 'smooth'});
      ev.preventDefault();
    }
  }
}
