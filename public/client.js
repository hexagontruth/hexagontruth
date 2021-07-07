const PAGE_REDIRECTS = {
  discord: 'https://discord.gg/t6hrz7S',
  youtube: 'https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g',
  sr: 'https://superrare.co/hexagontruth',
  cryptoart: 'https://tryshowtime.com/hexagontruth',
  cv: 'https://www.cryptovoxels.com/play?coords=W@375.5W,603S,0.5U',
};

class Page {
  constructor() {
    this.body = document.body;
    this.loaded = false;
    this.scrollTabs = [];
    this.scrollMap = {};

    this.$ = (n) => document.querySelectorAll(n);
    this.$$ = (n) => document.querySelector(n);

    this.body.style.opacity = 0;

    this.setArgs();

    window.addEventListener('DOMContentLoaded', (ev) => this.onDom(ev));
    window.addEventListener('load', (ev) => this.onLoad(ev));
    window.addEventListener('resize', (ev) => this.onResize(ev));
    window.addEventListener('scroll', (ev) => this.onScroll(ev));
    window.addEventListener('wheel', (ev) => this.onWheel(ev), {passive: false});
    window.addEventListener('keydown', (ev) => this.onKeydown(ev));

    setTimeout(() => this.onLoad(), 1000);
  }

  setArgs() {
    let [base, query] = window.location.href.split('?');
    let argPairs = (query || '').split('&').map((e) => e.split('='));
    this.args = {};
    for (let [k, v] of argPairs) {
      this.args[k] = v;
    }

    Object.entries(PAGE_REDIRECTS).forEach(([k, v]) => {
      if (this.args[k]) {
        window.location.href = v;
      }
    });
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
    this.scrollBlocks = Array.from(this.$('.scroll-block'));
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
        window.scrollTo(0, this.scrollBlocks[i].offsetTop);
        this.setSnap(i);
      });
    }
  }

  showAlert(msg) {
    this.alertText.innerHTML = msg;
    this.alert.classList.add('active');
    setTimeout(this.closeAlert, 4000);
  }

  closeAlert() {
    let active = this.alert.classList.contains('active');
    if (active) {
      this.alert.classList.remove('active');
      setTimeout(() => this.alertText.innerHTML = '', 500);
    }
  }

  autoSnap() {
    if (!this.scrollBlocks?.length) return;
    let y = window.scrollY;
    let delta = Infinity, idx = -1;
    for (let i = 0; i < this.scrollBlocks.length; i++) {
      let cur = Math.abs(this.scrollBlocks[i].offsetTop - y);
      if (cur < delta) {
        delta = cur;
        idx = i;
      }
    }
    window.scrollTo(0, scrollBlocks[idx].offsetTop);
  }

  setSnap(n) {
    let snap = this.getSnapObject();
    snap[window.location.pathname] = n;
    sessionStorage.setItem('snap', JSON.stringify(snap));
  }

  getSnap() {
    let snap = this.getSnapObject();
    return parseInt(snap[window.location.pathname]) || 0;
  }

  getSnapObject() {
    let str = sessionStorage.getItem('snap');
    return str ? JSON.parse(str) : {};
  }

  get hasScroll() {
    return !!this.scrollBlocks?.length;
  }

  onDom(ev) {
    this.header = this.$$('header');
    this.footer = this.$$('footer');

    this.alert = this.createElement('alert');
    this.alertText = this.createElement('mono', 'div', this.alert);
    this.alertText.addEventListener('click', () => this.closeAlert());

    this.setScrollBlocks();

    this.setAnchor();

    this.onResize();
    this.onScroll();

    // GA stuff
    this.gaScript = document.createElement('script');
    this.gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=UA-38703351-3';
    this.body.appendChild(this.gaScript);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-38703351-3');
  }


  onLoad(ev) {
    if (this.loaded) return;
    this.loaded = true;

    if (this.args.contact) {
      showAlert('Thank u for ur submission');
    }

    Video.create(this.$$('.parallax *'));

    document.body.style.transition = 'opacity 1000ms';
    document.body.style.opacity = 1;
  }

  onResize(ev) {
    // document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    // // for fucks sake
    // let pos = window.scrollY;
    // autoSnap();
    // if (timer == null) {
    //   timer = setInterval(() => {
    //     let last = pos;
    //     pos = window.scrollY;
    //     if (Math.abs(pos - last) < 1) {
    //       clearInterval(timer);
    //       timer = null;
    //       autoSnap();
    //     }
    //   }, 20);
    // }
  }

  onScroll(ev) {
    if (!this.hasScroll) return;
    this.scrollTabs.forEach((e) => e.classList.remove('active'));
    let cur = this.scrollBlocks.findIndex((e) => this.eq(e.offsetTop));
    if (cur != -1) {
      this.setSnap(cur);
      this.scrollTabs[cur].classList.add('active');
    }
  }

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

class Video {
  static create(el) {
    Video.instance && Video.instance.delete();
    Video.instance = el && new Video(el);
  }

  constructor(el) {
    this.el = el;
    let slug = el.getAttribute('data-slug');
    this.sizes = el.getAttribute('data-sizes').split(',').map((e) => parseInt(e));
    this.breakpoints = el.getAttribute('data-breakpoints').split(',').map((e) => parseInt(e));
    this.filenames = this.sizes.map((e) => slug.replace('%', e));
    this.selected = Infinity;
    this.q = {};
    window.addEventListener('resize', (ev) => this.onResize(ev));
    window.addEventListener('scroll', (ev) => this.onScroll(ev));
    this.onResize();
    this.onScroll();
  }

  queueEventHandler(eventName, fn) {
    if (this.q[eventName]) {
      clearTimeout(this.q[eventName]);
    }
    this.q[eventName] = setTimeout(fn, 100);
  }

  selectSource() {
    let last = this.selected;
    this.selected = Math.min(this.selected, this.breakpoints.findIndex((e) => e < this.maxDim));
    if (last != this.selected)
      this.el.src = this.filenames[this.selected];
  }

  onScroll(ev) {
    this.scrollPos = window.scrollY / this.scrollRange;
    this.el.style.transform = `translateY(${(-this.parallaxRange * this.scrollPos).toFixed(2)}px)`;
  }

  onResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.scrollRange = document.documentElement.scrollHeight - height;
    this.scrollFactor = document.documentElement.scrollHeight / height;
    this.parallaxFactor = 1 + (this.scrollFactor - 1) / 6;
    this.parallaxRange = (this.parallaxFactor - 1) * height;
    this.w = width;
    this.h = height * this.parallaxFactor;
    this.el.style.height = `${this.h}px`;
    this.maxDim = Math.max(this.w, this.h);
    this.selectSource();
  }
}

let page = new Page();
