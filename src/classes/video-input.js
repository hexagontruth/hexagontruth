import CanvasInput from './canvas-input.js';

export default class VideoInput extends CanvasInput {
  constructor(args={}) {
    super(page, args);
    let defaults = {
      video: args.video || document.createElement('video'),
      fit: "cover",
      size: 256,
    };
    Object.assign(this, defaults);
    this.ctx = this.canvas.getContext('2d', {willReadFrequently: true});
    this.active = false;
    this.flip = true;
    this.updateQueued = 0;
    this.video.loop = true;
    this.video.muted = true;

    this.setFit();
    this.setSize();

    this.video.oncanplay = () => this.toggleActive(true);
    // this.video.onended = () => this.setPlay();
  }

  setFit(fit=this.fit) {
    fit = fit || this.fit;
    this.fit = this.video.style.objectFit = fit;
    this.setSize();
  }

  setSize(size=this.size) {
    const {canvas, fit, video} = this;
    size = Array.isArray(size) ? size : [size, size];
    this.size = size;
    [canvas.width, canvas.height] = size;
    [video.width, video.height] = size;
    this.setTranslation();

    const [sw, sh] = [video.videoWidth, video.videoHeight];
    const [dw, dh] = [canvas.width, canvas.height];
    const sr = sw / sh;
    const dr = dw / dh;
    let cond = this.fit == 'cover' ? dr > sr : dr < sr;
    let w, h;
    if (cond) {
      w = dw;
      h = dh * dr / sr;
    }
    else {
      w = dw / dr * sr;
      h = dh;
    }

    [this.w, this.h] = [w, h];
  }

  setTranslation() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
  }

  setSrc(src) {
    if (typeof src == 'string')
      this.video.src = src;
    else
      this.video.srcObject = src;
  }

  updateFromStream() {
    this.loadFrame();
    this.updateQueued = Math.max(0, this.updateQueued - 1); // I forget the point of this? To prevent double loops?
    if (this.active && this.updateQueued == 0) {
      this.updateQueued++;
      window.requestAnimationFrame(() => this.updateFromStream());
    }
  }

  toggleActive(state) {
    state = state != null ? state : !this.active;
    this.active = state;
    if (state && this.updateQueued == 0) {
      this.updateQueued++;
      this.updateFromStream();
    }
    this.setPlay();
  }

  async setPlay() {
    this.setSize();
    try {
      this.active ? await this.video.play() : await this.video.pause();
    }
    catch (e) {
      // We apparently cannot dynamically play without user interaction, even on mute?
      console.error(e);
    }
  }

  loadFrame() {
    const {w, h} = this;
    this.ctx.drawImage(this.video, -w / 2, -h / 2, w, h);
    this.ctx.fillStyle = "#f00";
    this.onload && this.onload();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
