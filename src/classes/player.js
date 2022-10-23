import HookSet from './hook-set.js';
import ShaderProgram from './shader-program.js';
import playerDefs from '../player-defs.js';
import webglUtils from '../webgl-utils.js';

const DEFAULT_INTERVAL = 33;

const BASE_UNIFORMS = {
  duration: 720,
  counter: 0,
  time: 0,
  skipInterval: 30,
  skipTime: 0,
  skip: false,
  size: [0, 0],
  cover: [1, 1],
  contain: [1, 1],
  lastSize: [0, 0],
  parallax: [0, 0],
  dir: [0, 0],
  zoom: 1,
  aspect: 1,
  clock: 0,
  resize: false,
  resizeAt: 0,
  scrollPos: 0,
  cursorDownAt: 0,
  cursorUpAt: 0,
  cursorHex: [0, 0, 0],
  cursorHexRounded: [0, 0, 0],
  cursorPos: [0, 0],
  cursorLastPos: [0, 0],
  cursorDownPos: [0, 0],
  cursorUpPos: [0, 0],
  cursorDown: false,
  cursorAngle: 0,
  shiftKey: false,
  keyW: false,
  keyA: false,
  keyS: false,
  keyD: false,
};

export default class Player {
  constructor(page, name, canvas) {
    this.page = page;
    this.name = name;
    this.config = playerDefs[name];
    this.shaderDefs = this.config.shaders;
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2');

    this.uniforms = Object.assign({}, BASE_UNIFORMS, this.config.uniforms);
    this.shaderPrograms = [];
    this.counter = 0;
    this.time = 0;
    this.interval = this.config.interval || DEFAULT_INTERVAL;
    this.minPixelRatio = this.config.minPixelRatio || 1;
    this.customInputKeys = [];
    this.customInput = {};
    this.customTextures = {};
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
    ], this);
    this.hooks.addAll(this.config.hooks);

    if (this.config.size && !isNaN(this.config.size)) {
      this.config.size = [this.config.size, this.config.size];
    }
    this.setSize();

    window.addEventListener('resize', (ev) => this.handleResize(ev));
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));

    this.handleResize();
    this.handleScroll();
    this.clear();
    this.shaderPrograms = ShaderProgram.build(this, this.shaderDefs);
  }

  loadCustomTextures() {
    const {customInput, customTextures, gl} = this;
    if (this.config.customInput) {
      this.customInputKeys = Object.keys(this.config.customInput);
      this.customInputKeys.forEach((key) => {
        const fn = this.config.customInput[key];
        const inputObject = fn(this);
        customInput[key] = inputObject;
        const texture = gl.createTexture();
        customTextures[key] = texture;

        const [w, h] = [inputObject.canvas.width, inputObject.canvas.height];
        webglUtils.resetTexture(gl, texture, {flip: inputObject.flip});
      });
    }
  }

  clear() {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  setup() {
    const {gl} = this;
    const vertArray = new Float32Array([
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0,
    ]);

    const vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);

    for (const program of this.shaderPrograms) {
      const vertPositionAttribute = gl.getAttribLocation(program.program, 'vertexPosition');
      gl.enableVertexAttribArray(vertPositionAttribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
      gl.vertexAttribPointer(vertPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    }
  }

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
    this.uniforms.resize = true;
    this.uniforms.dir = [0, 0];
    this.playing || this.run(); // Draw at least one frame
    this.hooks.call('onReset');
  }

  run() {
    this.hooks.call('beforeRun');
    const {gl, shaderPrograms, uniforms} = this;
    const cur = this.counter % 2;
    const last = (cur + 1) % 2;
    const programCount = this.shaderPrograms.length;

    uniforms.counter = this.counter;
    uniforms.time = (uniforms.counter % uniforms.duration) / uniforms.duration;
    uniforms.skipTime = (uniforms.counter % uniforms.skipInterval) / uniforms.skipInterval;
    uniforms.skip = uniforms.skipTime == 0;
    uniforms.clock = (Date.now() % 1000) / 1000,
    this.customInputKeys.forEach((key) => {
      const texture = this.customTextures[key];
      const ctx = this.customInput[key].ctx;
      const src = this.customInput[key].textureSrc;
      // Workaround for flickering
      // if (ctx) {
      //   const data = ctx.getImageData(0, 0, 1, 1).data;
      //   if (data[3] == 0) {
      //     return;
      //   }
      // }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.width, src.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    });
    
    for (let i = 0; i < programCount; i++) {
      const li = (i + programCount - 1) % programCount;
      const program = shaderPrograms[i];
      uniforms.lastSize = uniforms.size.slice();
      uniforms.size = program.size || this.size;
      uniforms.cover = program.cover;
      uniforms.contain = program.contain;
      uniforms.aspect = program.aspect;

      const lastTexture = program.textures[last];
      let inputTexture = shaderPrograms[li].textures[cur];
      if (programCount > 1 && i == 0) {
        // This assumes a final top shader layer not fed back to the bottom
        inputTexture = shaderPrograms[programCount - 2].textures[last];
      }

      program.setTextures({inputTexture, lastTexture, ...this.customTextures});
      program.setUniforms(uniforms);

      const framebuffer = i < programCount - 1 ? program.framebuffers[cur] : null;
      gl.viewport(0, 0, ...uniforms.size);
      gl.useProgram(program.program);
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    this.hidden && this.setHidden(false);

    this.hooks.call('afterRun');
    uniforms.resize = false;
    this.counter++;
    this.time = this.counter / uniforms.duration;
  }

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
    this.canvas.width = w;
    this.canvas.height = h;
    this.setSize();
    this.scrollRange = document.documentElement.scrollHeight - dh;

    this.contain = w > h ? [w / h, 1] : [1, h / w];
    this.cover = w > h ? [1, h / w] : [w / h, 1];

    this.uniforms.resize = true;
    this.uniforms.resizeAt = true;
    this.gl.viewport(0, 0, w, h);
    this.shaderPrograms.forEach((e) => e.handleResize(ev));
  }

  handleScroll(ev) {
    // TODO: Figure out wtf is wrong with this
    this.scrollPos = window.scrollY / this.scrollRange;
    this.uniforms.parallax[1] = this.scrollPos * 2 + 1;
  }
}
