(() => {
  document.body.style.opacity = 0;
  let loaded = false;
  let scrollBlocks, buttons, alert, alertText, timer;

  const REDIRECTS = {
    discord: 'https://discord.gg/t6hrz7S',
    youtube: 'https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g',
    sr: 'https://superrare.co/hexagontruth',
    cryptoart: 'https://superrare.co/hexagontruth',
  };
  let [base, query] = window.location.href.split('?');
  let argPairs = (query || '').split('&').map((e) => e.split('='));
  let args = argPairs.map((e) => e[0]);
  Object.entries(REDIRECTS).forEach(([k, v]) => {
    if (args.includes(k)) {
      window.location.href = v;
    }
  });

  let eq = (y) => Math.abs(window.scrollY - y) < 5; // thanks webkit

  document.body.lastChild.insertAdjacentHTML('afterend', `
    <footer class="footer">
      <section class="flex larger">
        <ul class="links">
          <li><a title="Twitter" class="icon-twitter" href="https://twitter.com/hexagontruth"></a></li>
          <li><a title="YouTube" class="icon-youtube" href="https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g"></a></li>
          <li><a title="Facebook" class="icon-facebook" href="https://facebook.com/hexagonalawareness"></a></li>
          <li><a title="Instagram" class="icon-instagram" href="https://www.instagram.com/hexagontruth/"></a></li>
          <li><a title="Discord" class="icon-discord" href="https://discordapp.com/invite/t6hrz7S"></a></li>
          <li><a title="Reddit" class="icon-reddit" href="https://reddit.com/r/hexagons"></a></li>
          <li><a title="Patreon" class="icon-patreon" href="https://www.patreon.com/m/hexagontruth"></a></li>
          <li><a title="Merch" class="icon-tshirt" href="https://www.redbubble.com/people/hexagrahamaton/shop"></a></li>
        </ul>
      </section>
    </footer>
  `);

  // GA stuff
  let asyncScript = document.createElement('script');
  asyncScript.src = 'https://www.googletagmanager.com/gtag/js?id=UA-38703351-3';
  document.body.appendChild(asyncScript);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-38703351-3');

  function onLoad() {
    if (loaded) return;
    loaded = true;
    alert = createElement('alert');
    alertText = createElement('mono', 'div', alert);
    scrollBlocks = Array.from(document.querySelectorAll('article'));
    window.s = scrollBlocks;
    buttons = [];
    let buttonGroup = createElement('buttons', 'header');
    for (let i = 0; i < scrollBlocks.length; i++) {
      let button = createElement('button', 'button', buttonGroup);
      buttons.push(button);
      button.addEventListener('click', () => {
        if (!scrollBlocks) return;
        window.scrollTo(0, scrollBlocks[i].offsetTop);
        setSnap(i);
      });
    }
    onResize();
    onScroll();
    document.querySelector('.alert div').addEventListener('click', () => closeAlert());
    if (args.includes('contact')) {
      showAlert('Thank u for ur submission');
    }

    Video.create(document.querySelector('.parallax *'));

    document.body.style.transition = 'opacity 1000ms';
    document.body.style.opacity = 1;
  }

  function createElement(className, tag='div', parent=document.body) {
    let element = document.createElement(tag);
    element.className = className;
    parent && parent.appendChild(element);
    return element;
  }

  function showAlert(msg) {
    alertText.innerHTML = msg;
    alert.classList.add('active');
    setTimeout(closeAlert, 4000);
  }

  function closeAlert() {
    let active = alert.classList.contains('active');
    if (active) {
      alert.classList.remove('active');
      setTimeout(() => alertText.innerHTML = '', 500);
    }
  }

  function onScroll() {
    if (!scrollBlocks) return;
    buttons.forEach((e) => e.classList.remove('active'));
    let cur = scrollBlocks.findIndex((e) => eq(e.offsetTop));
    if (cur != -1) {
      setSnap(cur);
      buttons[cur].classList.add('active');
    }
  }

  function onResize() {
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

  function autoSnap() {
    if (!scrollBlocks) return;
    let y = window.scrollY;
    let delta = Infinity, idx = -1;
    for (let i = 0; i < scrollBlocks.length; i++) {
      let cur = Math.abs(scrollBlocks[i].offsetTop - y);
      if (cur < delta) {
        delta = cur;
        idx = i;
      }
    }
    window.scrollTo(0, scrollBlocks[idx].offsetTop);
  }

  function setSnap(n) {
    let snap = getSnapObject();
    snap[window.location.pathname] = n;
    sessionStorage.setItem('snap', JSON.stringify(snap));
  }

  function getSnap() {
    let snap = getSnapObject();
    return parseInt(snap[window.location.pathname]) || 0;
  }

  function getSnapObject() {
    let str = sessionStorage.getItem('snap');
    return str ? JSON.parse(str) : {};
  }

  setTimeout(onLoad, 1000);
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onLoad);
  window.addEventListener('wheel', (ev) => {
    if (!scrollBlocks) return;
    let pts = scrollBlocks.map((e) => e.offsetTop);
    let newY = window.scrollY;
    let nextPoint;
    if (ev.deltaY > 0) {
      nextPoint = pts.find((e) => !eq(e, pts[getSnap()]) && e > newY);
    }
    else {
      nextPoint = pts.slice().reverse().find((e) => !eq(e, pts[getSnap()]) && e < newY);
    }
    nextPoint != null && window.scrollTo(0, nextPoint);
    ev.preventDefault();
  }, {passive: false});
  window.addEventListener('scroll', onScroll);
  window.addEventListener('keydown', (ev) => {
    if (!scrollBlocks) return;
    if (ev.key == ' ') {
      let lastPoint = scrollBlocks.slice(-1)[0].offsetTop;
      if (lastPoint == window.scrollY) {
        window.scrollTo(0, 0);
        ev.preventDefault();
      }
    }
  });

})();

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
