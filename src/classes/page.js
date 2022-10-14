import Player from './player.js';

const PAGE_REDIRECTS = {
  cryptovoxels: 'https://www.cryptovoxels.com/play?coords=W@375.5W,603S,0.5U',
  discord: 'https://discord.gg/t6hrz7S',
  opensea: 'https://opensea.io/hexagontruth',
  rarible: 'https://rarible.com/hexagontruth',
  showtime: 'https://tryshowtime.com/hexagontruth',
  superrare: 'https://superrare.co/hexagontruth',
  youtube: 'https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g',
  cv: 'https://www.cryptovoxels.com/play?coords=W@375.5W,603S,0.5U',
  voxels: 'https://www.cryptovoxels.com/play?coords=W@375.5W,603S,0.5U',
  sr: 'https://superrare.co/hexagontruth',
  yt: 'https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g',
};

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
    window.addEventListener('keydown', (ev) => this.handleKey(ev));
    window.addEventListener('keyup', (ev) => this.handleKey(ev));
    window.addEventListener('pointercancel', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerdown', (ev) => this.handlePointer(ev));
    window.addEventListener('pointermove', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerout', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerup', (ev) => this.handlePointer(ev));
    window.addEventListener('resize', (ev) => this.onResize(ev));
    window.addEventListener('scroll', (ev) => this.onScroll(ev));

    // This goes against everything I believe in but fuck you Chrome
    if (window.chrome) {
      window.addEventListener('wheel', (ev) => this.onWheel(ev), {passive: false});
    }

    setTimeout(() => this.onLoad(), 1000);
  }

  setArgs() {
    let [base, query] = window.location.href.split('?');
    let argPairs = (query || '').split('&').map((e) => e.split('='));
    this.args = {};
    for (let [k, v] of argPairs) {
      this.args[k] = k;
    }

    Object.entries(PAGE_REDIRECTS).forEach(([k, v]) => {
      if (this.args[k]) {
        window.location.href = v;
      }
    });
  }

  onLoad(ev) {
    if (this.loaded) return;
    this.loaded = true;

    this.body = document.body;
    this.header = document.querySelector('header');
    this.footer = document.querySelector('footer');
    this.prod && this.onProd();

    this.players = {};
    document.querySelectorAll('.player').forEach((el) => {
      const name = el.getAttribute('data-program');
      const controls = el.getAttribute('data-control');
      const player = new Player(name, el, controls);
      this.players[name] = player;
    });

    this.counter = document.querySelector('.counter');
    this.players.background.addHook('afterRun', () => this.updateCounter());
    this.title = document.querySelector('h1');
    this.letters = document.querySelectorAll('h1 span');

    document.querySelectorAll('.video-thumbs li').forEach((thumb) => {
      let video = thumb.querySelector('video');
      let dataSrc = video?.getAttribute('data-src');
      if (!dataSrc) return;
      video.src = dataSrc;
      video.addEventListener('canplay', () => {
        thumb.style.opacity = 1;
      });
    });

    this.setScrollBlocks();
    this.setAnchor();
    this.onResize();
    this.onScroll();

    document.body.style.transition = 'opacity 1000ms';
    document.body.style.opacity = 1;

    this.players.background.start();
  }

  updateCounter() {
    const paddedCount = ('00000' + this.players.background.counter).slice(-6);
    this.counter.innerHTML = paddedCount;
  }

  hideTitle() {
    this.players.logo.stop();
    this.players.logo.clear();
    this.titleHidden = true;
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

  eq(y) {
    return Math.abs(window.scrollY - y) < 5; 
  }

  createElement(className, tag='div', parent=document.body) {
    let element = document.createElement(tag);
    element.className = className;
    parent && parent.appendChild(element);
    return element;
  }

  setScrollBlocks(scrollBlocks) {
    this.scrollBlocks = Array.from(document.querySelectorAll('.scroll-block'));
    if (!this.hasScroll)
      return;
    this.scrollTabGroup = this.createElement('scroll-tabs', 'nav', this.header);
    for (let i = 0; i < this.scrollBlocks.length; i++) {
      let id = this.scrollBlocks[i].id;
      if (id) {
        this.scrollMap[id] = i;
      }
      let tab = this.createElement('scroll-tab', 'button', this.scrollTabGroup);
      this.scrollTabs.push(tab);
      tab.addEventListener('click', () => {
        if (!this.scrollBlocks) return; // what was this for?
        location.hash = this.scrollBlocks[i].id || '';
        // window.scrollTo(0, this.scrollBlocks[i].offsetTop);
        this.setSnap(i);
      });
    }
  }

  setSnap(n) {
    this.snap = n;
    let snap = this.getSnapObject();
    snap[window.location.pathname] = n;
    sessionStorage.setItem('snap', JSON.stringify(snap));
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

  onResize(ev) {

  }

  handleKey(ev) {
    const {background} = this.players;
    const {uniforms} = background;
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
        background.reset();
        background.run();
      }
      else if (key == 'T') {
        background.toggle();
      }
      else if (key == 'C') {
        background.toggleControls();
      }
      else if (key == 'G') {
        if (background.playing)
          background.stop();
        else
          background.run();
      }
    }
  }

  handlePointer(ev) {
    if (!this.players.background) return;
    const {uniforms} = this.players.background;
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

  onScroll(ev) {
    if (!this.hasScroll) return;
    this.scrollTabs.forEach((e) => e.classList.remove('active'));
    let cur = this.scrollBlocks.findIndex((e) => this.eq(e.offsetTop));
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
      nextPoint = pts.find((e) => !this.eq(e, pts[this.getSnap()]) && e > newY);
    }
    else {
      nextPoint = pts.slice().reverse().find((e) => !this.eq(e, pts[this.getSnap()]) && e < newY);
    }
    nextPoint != null && window.scrollTo(0, nextPoint);
    ev.preventDefault();
  }
}
