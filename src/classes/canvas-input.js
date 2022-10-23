export default class CanvasInput {
  constructor(args={}) {
    let defaults = {
      canvas: args.canvas || document.createElement('canvas'),
    };
    Object.assign(this, defaults, args);
  }

  get textureSrc() {
    return this.canvas;
  }

}
