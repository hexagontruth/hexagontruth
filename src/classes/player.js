import Hook from './hook.js';
import Program from './program.js';

const BASE_UNIFORMS = {
  duration: 360,
  counter: 0,
  time: 0,
  size: [0, 0],
  lastSize: [0, 0],
  parallax: [0, 0],
  dir: [0, 0],
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
  constructor(canvas, controls, programDefs, uniformOverrides={}) {
    this.canvas = canvas;
    this.controls = controls;
    this.gl = canvas.getContext('webgl2');
    this.programDefs = Object.assign({}, programDefs);
    this.uniforms = Object.assign({}, BASE_UNIFORMS, uniformOverrides);
    this.programs = [];
    this.counter = 0;
    this.size = [0, 0];
    this.interval = 17;
    this.hooks = {
      beforeRun: new Hook(),
      afterRun: new Hook(),
    };

    window.addEventListener('keydown', (ev) => this.handleKey(ev));
    window.addEventListener('keyup', (ev) => this.handleKey(ev));
    window.addEventListener('pointercancel', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerdown', (ev) => this.handlePointer(ev));
    window.addEventListener('pointermove', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerout', (ev) => this.handlePointer(ev));
    window.addEventListener('pointerup', (ev) => this.handlePointer(ev));
    window.addEventListener('resize', (ev) => this.handleResize(ev));
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));

    this.handleResize();
    this.handleScroll();

    this.gl.clearColor(1, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.programs = Program.build(this, programDefs);
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

  reset() {
    this.counter = 0;
    this.uniforms.resize = true;
    this.uniforms.dir = [0, 0];
    this.callHook('afterRun');
  }

  run() {
    this.callHook('beforeRun');
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

    this.callHook('afterRun');
    uniforms.resize = false;
    this.counter++;
  }

  loop() {
    if (!this.playing) return;
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
    this.controls.classList.toggle('hidden', state);
  }

  addHook(key, fn) {
    return this.hooks[key]?.add(fn);
  }

  removeHook(key) {
    return this.hooks[key]?.remove(key);
  }

  callHook(key, ...args) {
    return this.hooks[key]?.call(...args);
  }

  handleKey(ev) {
    const {uniforms} = this;
    const key = ev.key.toUpperCase();
    const uniformKey = `key${key}`;
    if ('WASD'.includes(key)) {
      const wasdMap = {
        W: [0, 1],
        A: [-1, 0],
        S: [0, -1],
        D: [1, 0],
      };
      const dirDelta = wasdMap[key];
      if (ev.type == 'keydown') {
        uniforms[uniformKey] = true;
        uniforms.dir = uniforms.dir.map((e, i) => e +dirDelta[i]);
      }
      else if (ev.type == 'keyup') {
        uniforms[uniformKey] = false;
        uniforms.dir = uniforms.dir.map((e, i) => e +dirDelta[i]);
      }
    }
    else if (ev.type == 'keydown') {
      if (key == 'R') {
        this.reset();
        this.run();
      }
      else if (key == 'T') {
        this.toggle();
      }
      else if (key == 'C') {
        this.toggleControls();
      }
      else if (key == 'G') {
        if (this.playing)
          this.stop();
        else
          this.run();
      }
    }
  }

  handlePointer(ev) {
    const {uniforms} = this;
    const pos = [
      ev.clientX / this.dw * 2 - 1,
      ev.clientY / this.dh * -2 + 1,
    ];
    uniforms.cursorLast = uniforms.cursorPos;
    uniforms.cursorPos = pos;

    if (ev.type == 'pointerdown') {
      uniforms.cursorDown = true;
      uniforms.cursorDownAt = this.counter;
      uniforms.cursorDownPos = pos.slice();
    }
    else if (ev.type == 'pointerup' || ev.type == 'pointerout' || ev.type == 'pointercancel') {
      uniforms.cursorDown = false;
      uniforms.cursorUpAt = this.counter;
      uniforms.cursorUpPos = pos.slice();
    }

    uniforms.cursorAngle = Math.atan2(pos[1], pos[0]);
  }

  handleResize(ev) {
    const dpr = Math.max(window.devicePixelRatio, 2);
    const [dw, dh] = [window.innerWidth, window.innerHeight];
    const [w, h] = [dw, dh].map((e) => Math.round(e * dpr));
    this.dw = dw;
    this.dh = dh;
    this.w = w;
    this.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.size = [w, h];
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
