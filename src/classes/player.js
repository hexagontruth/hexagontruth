import HookSet from './hook-set.js';


export default class Player {
  constructor(page, name, canvas, config) {
    this.page = page;
    this.name = name;
    this.canvas = canvas;
    this.config = config;

    this.counter = 0;
    this.interval = this.config.interval || Player.DEFAULT_INTERVAL;
    this.minPixelRatio = this.config.minPixelRatio || 1;
    this.hidden = false;

    this.config.hooks = this.config.hooks || {};
    this.hooks = new HookSet([
      'beforeRun',
      'afterRun',
      'onReset',
      'onStart',
      'onStop',
      'onPointer',
      'onKey',
      'onResize',
      'onScroll',
    ], this);
    this.hooks.addAll(this.config.hooks);

    if (this.config.size && !isNaN(this.config.size)) {
      this.config.size = [this.config.size, this.config.size];
    }
    this.setSize();
  }

  initialize() {}

  clear() {}

  setup() {}

  setSize() {
    this.size = this.config.size?.slice() || [this.w, this.h];
  }

  setHidden(val) {
    this.hidden = val;
    this.canvas.classList.toggle('hidden', val);
  }

  hide() {
    this.setHidden(true);
    this.stop();
  }

  reset() {
    this.counter = 0;
    this.playing || this.run(); // Draw at least one frame
    this.hooks.call('onReset');
  }

  run() {}

  loop() {
    if (!this.playing) return;
    if (this.config.stopAt && this.config.stopAt <= this.counter) return;
    const now = Date.now();
    if (now >= this.last + this.interval) {
      this.last = now;
      this.run();
    }
    requestAnimationFrame(() => this.loop());
  }

  start(reset=true) {
    this.playing = true;
    this.last = Date.now();
    this.setup();
    reset && this.reset();
    this.hooks.call('onStart');
    requestAnimationFrame(() => this.loop());
  }

  stop() {
    this.playing = false;
    this.hooks.call('onStop');
  }

  toggle() {
    this.playing ? this.stop() : this.start(false);
  }

  handleResize(ev) {
    const dpr = Math.max(window.devicePixelRatio, this.minPixelRatio);
    const [dw, dh] = [this.canvas.offsetWidth, this.canvas.offsetHeight];
    const [w, h] = [dw, dh].map((e) => Math.round(e * dpr));
    this.dw = dw;
    this.dh = dh;
    this.w = w;
    this.h = h;
    this.contain = w > h ? [w / h, 1] : [1, h / w];
    this.cover = w > h ? [1, h / w] : [w / h, 1];
    this.canvas.width = w;
    this.canvas.height = h;
    this.setSize();
    this.hooks.call('onResize');
  }

  handleScroll(ev) {
    this.hooks.call('onScroll');
  }
}

Player.DEFAULT_INTERVAL = 33;
