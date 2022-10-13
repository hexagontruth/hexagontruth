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

const PROGRAM_DEFS = [
  // [
  //   'vertex-position',
  //   'ca-state',
  //   {size: [256, 256], uniforms: { gridSize: 10, skip: 10 }},
  // ],
  // [
  //   'vertex-position',
  //   'ca-display',
  //   {uniforms: { gridSize: 10, skip: 10 }},
  // ],
  [
    'vertex-position',
    'flake',
  ],
];

const PROD_HOST = 'hexagontruth.com';

export default class Page {
  constructor() {
    this.loaded = false;
    this.scrollTabs = [];
    this.scrollMap = {};
    this.letterTimer = null;
    this.letterInterval = 150;

    this.prod = window.location.host == PROD_HOST;

    this.setArgs();

    window.addEventListener('load', (ev) => this.onLoad(ev));
    window.addEventListener('resize', (ev) => this.onResize(ev));
    window.addEventListener('scroll', (ev) => this.onScroll(ev));
    window.addEventListener('keydown', (ev) => this.onKeydown(ev));

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
    this.player = new Player(document.querySelector('canvas.player'), PROGRAM_DEFS);
    this.title = document.querySelector('h1');
    this.letters = document.querySelectorAll('h1 span');
    this.titleHidden = false;

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

    this.player.start();
  }

  hideTitle() {
    this.titleHidden = true;
    this.letterTimer && clearTimeout(this.letterTimer);
    this.letters.forEach((e) => e.classList.toggle('hidden', true));
    this.title.className = 't0';
    this.letterIdx = 0;
  }

  animateTitle() {
    this.hideTitle();
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

  onKeydown(ev) {
    if (!this.hasScroll) return;
    if (ev.key == ' ') {
      let lastPoint = this.scrollBlocks.slice(-1)[0].offsetTop;
      if (lastPoint == window.scrollY) {
        window.scrollTo(0, 0);
        ev.preventDefault();
      }
    }
  }
}
