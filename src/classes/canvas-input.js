export default class CanvasInput {
  constructor(page, args={}) {
    let defaults = {
      canvas: args.canvas || document.createElement('canvas'),
    };
    Object.assign(this, defaults, args);

    this.page = page;
    this.ctx = this.canvas.getContext('2d');
  }

  get textureSrc() {
    return this.canvas;
  }

}
