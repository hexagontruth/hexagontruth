import Player from './player.js';

function requireAll(ctx) {
  const kvPairs = ctx.keys().map((e) => {
    const key = e.match(/([\w\-]+)\.js/)?.[1];
    const value = ctx(e).default;
    return [key, value];
  });
  return Object.fromEntries(kvPairs);
};

const SCRIPTS = requireAll(require.context('../scripts/', true, /\.js$/));

const BASE_PARAMS = {
  counter: 0,
  time: 0,
  duration: 360,
  size: [0, 0],
};

export default class Player2D extends Player {
  constructor(page, name, canvas, config) {
    super(page, name, canvas, config);

    this.transferCanvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.tctx = this.transferCanvas.getContext('2d');
    this.pixelRatio = this.config.pixelRatio || 2;

    this.scripts = this.config.scripts.map((e) => SCRIPTS[e]);
    this.params = Object.assign({}, BASE_PARAMS, this.config.params);
    this.setParams();
    this.handleResize();
  }

  setParams() {
    const {params} = this;
    params.counter = this.counter;
    params.time = this.counter / params.duration;
  }

  reset() {
    super.reset();
    this.clear();
  }

  clear() {
    this.ctx.clearRect(0, 0, ...this.size);
    this.tctx.clearRect(0, 0, ...this.tsize);
  }

  setup() {
    this.scripts.forEach((e) => e.setup(this.tctx, this.params));
  }

  run() {
    this.setParams();
    this.draw();
    this.hidden && this.setHidden(false);
    this.counter++;
  }

  draw() {
    this.scripts.forEach((e) => e.draw(this.tctx, this.params));
    this.transfer();
  }

  transfer() {
    this.ctx.clearRect(0, 0, ...this.size);
    this.ctx.drawImage(this.transferCanvas, 0, 0, ...this.size);
  }

  handleResize() {
    super.handleResize();
    const {params, tctx, pixelRatio, transferCanvas, w, h} = this;
    this.tsize = [w * pixelRatio, h * pixelRatio];
    [this.tw, this.th] = this.tsize
    params.size = this.tsize.slice();
    transferCanvas.width = this.tw;
    transferCanvas.height = this.th;

    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.translate(this.tw / 2, this.th / 2);
  }
}
