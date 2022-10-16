import HookSet from './hook-set.js';
import Player from './player.js';
import redirectDefs from '../redirect-defs.js';
import videoDefs from '../video-defs.js';

const PROD_HOST = 'hexagontruth.com';

export default class Page {
  constructor() {
    this.loaded = false;
    this.scrollTabs = [];
    this.scrollMap = {};
    this.letterTimer = null;
    this.letterInterval = 150;
    this.titleHidden = false;

    this.prod = window.location.host == PROD_HOST;

    this.setArgs();

    window.addEventListener('load', (ev) => this.onLoad(ev));

    setTimeout(() => this.onLoad(), 1000);
  }

  setArgs() {
    let [base, query] = window.location.href.split('?');
    let argPairs = (query || '').split('&').map((e) => e.split('='));
    this.args = {};
    for (let [k, v] of argPairs) {
      this.args[k] = k;
    }

    Object.entries(redirectDefs).forEach(([k, v]) => {
      if (this.args[k]) {
        window.location.href = v;
      }
    });
  }

  onLoad(ev) {
    if (this.loaded) return;
    this.loaded = true;

    this.body = document.body;
    this.header = document.querySelector('.header');
    this.footer = document.querySelector('.footer');
    this.prod && this.onProd();

    this.players = {};
    document.querySelectorAll('.player').forEach((el) => {
      const name = el.getAttribute('data-program');
      const controlsSelector = el.getAttribute('data-controls');
      const controls = document.querySelector(controlsSelector);
      const player = new Player(this, name, el, controls);
      this.players[name] = player;
    });
    this.players.main.hooks.add('afterRun', () => this.updateCounter());

    this.hooks = new HookSet(['afterSnap']);
    this.hooks.add('afterSnap', () => {
      if (this.scrollId == 'art') {
        this.players.video.start(false);
      }
      else if (this.players.video.playing) {
        this.players.video.stop();
      }
    });

    this.counter = document.querySelector('.counter');
    this.title = document.querySelector('h1');
    this.letters = document.querySelectorAll('h1 span');

    this.initializeVideo();

    document.querySelectorAll('.video-thumbs li').forEach((thumb) => {
      let video = thumb.querySelector('video');
      let dataSrc = video?.getAttribute('data-src');
      if (!dataSrc) return;
      video.src = dataSrc;
      video.addEventListener('canplay', () => {
        thumb.style.opacity = 1;
      });
    });

    window.addEventListener('keydown', (ev) => this.handleKey(ev));
    window.addEventListener('keyup', (ev) => this.handleKey(ev));
    window.addEventListener('pointercancel', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerdown', (ev) => this.handlePointer(ev));
    window.addEventListener('pointermove', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerout', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerup', (ev) => this.handlePointer(ev));
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));

    // This goes against everything I believe in but fuck you Chrome
    if (window.chrome && !navigator.maxTouchPoints) {
      window.addEventListener('wheel', (ev) => this.onWheel(ev), {passive: false});
    }

    this.setScrollBlocks();
    this.setAnchor();
    this.handleScroll();

    document.body.style.transition = 'opacity 1000ms';
    document.body.style.opacity = 1;

    this.players.main.start();
  }

  initializeVideo() {
    this.videoDefs = videoDefs.slice();
    this.videoContainer = document.querySelector('#video-container');
    this.videoLink = this.createElement(null, 'a', this.videoContainer);
    this.videoLink.target = "_blank";
    this.videoPlayers = Array(2).fill(null).map(() => {
      const video = this.createElement(null, 'video', this.videoLink);
      video.muted = true;
      video.loop = true;
      return video;
    });
    this.videoIdx = 0;
    this.videoPlayerIdx = 0;

    this.buttonPrev = document.querySelector('#button-prev');
    this.buttonNext = document.querySelector('#button-next');
    this.buttonPrev.addEventListener('click', () => this.rotateVideo(-1));
    this.buttonNext.addEventListener('click', () => this.rotateVideo(1));

    this.loadVideo(this.videoIdx);
  }

  rotateVideo(offset) {
    this.videoIdx = (this.videoIdx + offset + this.videoDefs.length) % this.videoDefs.length;
    this.loadVideo(this.videoIdx);
  }

  loadVideo(idx) {
    const videoDef = this.videoDefs[idx];
    const lastPlayer = this.videoPlayers[this.videoPlayerIdx % 2];
    const nextPlayer = this.videoPlayers[++this.videoPlayerIdx % 2];

    lastPlayer.classList.remove('active');
    lastPlayer.pause();

    nextPlayer.src = videoDef.src;
    nextPlayer.classList.add('active');
    nextPlayer.play();

    this.videoLink.href = videoDef.link;
    this.videoLink.title = videoDef.name;
  }

  updateCounter() {
    const paddedCount = ('00000' + this.players.main.counter).slice(-6);
    this.counter.innerHTML = paddedCount;
  }

  hideTitle() {
    this.titleHidden = true;
    this.players.logo.hide();
    this.letterTimer && clearTimeout(this.letterTimer);
    this.letters.forEach((e) => e.classList.toggle('hidden', true));
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
    this.letters[this.letterIdx].classList.toggle('hidden', false);
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

  createElement(className, tag='div', parent=document.body) {
    let element = document.createElement(tag);
    element.className = className || '';
    parent && parent.appendChild(element);
    return element;
  }

  setScrollBlocks(scrollBlocks) {
    const tabTemplate = this.createElement('scroll-tab', 'div');
    this.createElement('scroll-tab-inner', 'div', tabTemplate);

    this.scrollTabGroup = this.createElement('scroll-tabs', 'nav', this.header);
    this.scrollBlocks = Array.from(document.querySelectorAll('.scroll-block'));

    if (!this.hasScroll) return;
    
    for (let i = 0; i < this.scrollBlocks.length; i++) {
      const id = this.scrollBlocks[i].id;
      // if (!id) continue;

      const tab = tabTemplate.cloneNode(true);
      this.scrollTabGroup.appendChild(tab);
      this.scrollTabs.push(tab);
      this.scrollMap[id] = i;

      tab.addEventListener('click', () => {
        location.hash = this.scrollBlocks?.[i].id || '';
      });
    }
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
    this.hooks.call('afterSnap');
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

  get hasScroll() {
    return !!this.scrollBlocks?.length;
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

  eq(y, ep=5) {
    return Math.abs(window.scrollY - y) < ep; 
  }

  handleKey(ev) {
    const {main} = this.players;
    const {uniforms} = main;
    const key = ev.key.toUpperCase();
    const uniformKey = `key${key}`;
    if ('WASD'.includes(key)) {
      const wasdMap = {
        W: [0, 1],
        A: [-1, 0],
        S: [0, -1],
        D: [1, 0],
      };
      const dirDelta = wasdMap[key];
      if (ev.type == 'keydown') {
        uniforms[uniformKey] = true;
        uniforms.dir = uniforms.dir.map((e, i) => e +dirDelta[i]);
      }
      else if (ev.type == 'keyup') {
        uniforms[uniformKey] = false;
        uniforms.dir = uniforms.dir.map((e, i) => e +dirDelta[i]);
      }
    }
    else if (ev.type == 'keydown') {
      if (key == 'R') {
        main.reset();
        main.run();
      }
      else if (key == 'T') {
        main.toggle();
      }
      else if (key == 'C') {
        main.toggleControls();
      }
      else if (key == 'G') {
        if (main.playing)
          main.stop();
        else
          main.run();
      }
      else if (ev.key == 'Escape') {
        window.scrollTo(0, 0);
      }
      else if (ev.key == 'ArrowLeft' || ev.key == 'ArrowRight') {
        if (this.scrollId == 'art') {
          const offset = ev.key == 'ArrowLeft' ? -1 : 1;
          this.rotateVideo(offset);
        }
      }
    }
  }

  handlePointer(ev) {
    const {uniforms} = this.players.main;
    const pos = [
      ev.clientX / this.dw * 2 - 1,
      ev.clientY / this.dh * -2 + 1,
    ];
    uniforms.cursorLast = uniforms.cursorPos;
    uniforms.cursorPos = pos;

    if (ev.type == 'pointerdown') {
      uniforms.cursorDown = true;
      uniforms.cursorDownAt = this.counter;
      uniforms.cursorDownPos = pos.slice();
    }
    else if (ev.type == 'pointerup' || ev.type == 'pointerout' || ev.type == 'pointercancel') {
      uniforms.cursorDown = false;
      uniforms.cursorUpAt = this.counter;
      uniforms.cursorUpPos = pos.slice();
    }

    uniforms.cursorAngle = Math.atan2(pos[1], pos[0]);
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
    else if (window.scrollY == 0) {
      this.animateTitle();
    }
  }

  // This is only seemingly helping on desktop Chrome, and possibly only on Linux? Why does Chrome scroll snapping suck so badly?
  onWheel(ev) {
    if (!this.hasScroll) return;
    let pts = this.scrollBlocks.map((e) => e.offsetTop);
    let newY = window.scrollY;
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
