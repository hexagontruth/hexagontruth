(() => {
  document.body.style.opacity = 0;
  let loaded = false;
  let scrollBlocks, buttons, alert, alertText, timer;

  const REDIRECTS = {
    discord: 'https://discord.gg/t6hrz7S',
    youtube: 'https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g',
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

  document.body.insertAdjacentHTML('afterend', `
    <footer class="footer">
      <section class="flex small">
        <ul class="links">
          <li><a title="Hexagonal News on Twitter" class="icon-twitter" href="https://twitter.com/hexagonalnews"></a></li>
          <li><a title="Hexagonal Awareness on YouTube" class="icon-youtube" href="https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g"></a></li>
          <li><a title="Hexagonal Awareness on Facebook" class="icon-facebook" href="https://facebook.com/hexagonalawareness"></a></li>
          <li><a title="Hexagon Truth on Instagram" class="icon-instagram" href="https://www.instagram.com/hexagontruth/"></a></li>
          <li><a title="Hexagonal Awareness on LinkedIn" class="icon-linkedin" href="https://www.linkedin.com/company/hexnet"></a></li>
          <li><a title="Global Hexagonal Awareness Project on Tumblr" class="icon-tumblr" href="https://hexagonalawarenessproject.tumblr.com/"></a></li>
          <li><a title="Hexagon Truth on Twitch" class="icon-twitch" href="https://www.twitch.tv/hexagontruth"></a></li>
          <li><a title="Hexagons on Discord" class="icon-discord" href="https://discordapp.com/invite/t6hrz7S"></a></li>
          <li><a title="Hexagons subreddit" class="icon-reddit" href="https://reddit.com/r/hexagons"></a></li>
          <li><a title="Hexagonal merch" class="icon-tshirt" href="https://www.redbubble.com/people/hexagrahamaton/shop"></a></li>
        </ul>
      </section>
    </footer>
  `);

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
