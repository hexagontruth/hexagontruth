import HookSet from './hook-set.js';
import Program from './program.js';
import playerDefs from '../player-defs.js';

const DEFAULT_INTERVAL = 33;

const BASE_UNIFORMS = {
  duration: 360,
  counter: 0,
  time: 0,
  size: [0, 0],
  cover: [1, 1],
  contain: [1, 1],
  lastSize: [0, 0],
  parallax: [0, 0],
  dir: [0, 0],
  aspect: 1,
  clock: 0,
  resize: false,
  cursorDownAt: 0,
  cursorUpAt: 0,
  cursorPos: [0, 0],
  cursorLastPos: [0, 0],
  cursorDownPos: [0, 0],
  cursorUpPos: [0, 0],
  cursorDown: false,
  cursorAngle: 0,
  keyW: false,
  keyA: false,
  keyS: false,
  keyD: false,
};

export default class Player {
  constructor(page, name, canvas, controls) {
    this.page = page;
    this.name = name;
    this.config = playerDefs[name];
    this.shaderDefs = this.config.shaders;
    this.canvas = canvas;
    this.controls = controls;
    this.gl = canvas.getContext('webgl2');

    this.uniforms = Object.assign({}, BASE_UNIFORMS, this.config.uniforms);
    this.programs = [];
    this.counter = 0;
    this.interval = this.config.interval || DEFAULT_INTERVAL;
    this.minPixelRatio = this.config.minPixelRatio || 1;
    this.hidden = false;

    this.hooks = new HookSet(['beforeRun', 'afterRun']);

    if (this.config.size && !isNaN(this.config.size)) {
      this.config.size = [this.config.size, this.config.size];
    }
    this.setSize();

    window.addEventListener('resize', (ev) => this.handleResize(ev));
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));

    this.handleResize();
    this.handleScroll();
    this.clear();
    this.programs = Program.build(this, this.shaderDefs);
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

    for (const program of this.programs) {
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
    this.hooks.call('afterRun');
  }

  run() {
    this.hooks.call('beforeRun');
    const {gl, programs, uniforms} = this;
    const cur = this.counter % 2;
    const last = (cur + 1) % 2;
    const programCount = this.programs.length;

    uniforms.counter = this.counter;
    uniforms.time = (this.uniforms.counter % this.uniforms.duration) / this.uniforms.duration;
    uniforms.clock = Date.now();

    for (let i = 0; i < programCount; i++) {
      const li = (i + programCount - 1) % programCount;
      const program = programs[i];
      uniforms.lastSize = uniforms.size.slice();
      uniforms.size = program.size || this.size;
      uniforms.cover = program.cover;
      uniforms.contain = program.contain;
      uniforms.aspect = program.aspect;

      const lastTexture = program.textures[last];
      let inputTexture = programs[li].textures[cur];
      if (programCount > 1 && i == 0) {
        inputTexture = programs[programCount - 2].textures[last];
      }

      program.setTextures({inputTexture, lastTexture});
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
    this.loop();
  }

  stop() {
    this.playing = false;
  }

  toggle() {
    this.playing ? this.stop() : this.start(false);
  }

  toggleControls(state=undefined) {
    this.controls?.classList.toggle('hidden', state);
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
    this.scrollRange = document.documentElement.scrollHeight - dw;

    this.uniforms.resize = true;
    this.gl.viewport(0, 0, w, h);
    this.programs.forEach((e) => e.handleResize(ev));
  }

  handleScroll(ev) {
    this.scrollPos = window.scrollY / this.scrollRange;
    this.uniforms.parallax[1] = -this.scrollPos * 2 + 1;
  }
}
