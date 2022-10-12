import frag1 from '../shaders/frag-1.fs';
import frag2 from '../shaders/frag-2.fs';
import passthru from '../shaders/passthru.fs';
import vertexPosition from '../shaders/vertex-position.vs';

const SHADERS = {
  'vertex-position': vertexPosition,
  'passthru': passthru,
  'frag-1': frag1,
  'frag-2': frag2,
};

const BASE_UNIFORMS = {
  duration: 100,
  counter: 0,
  time: 0,
  size: [0, 0],
  clock: 0,
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
  pi: Math.PI,
  tau: Math.PI * 2,
  sr2: 2 ** 0.5,
  sr3: 3 ** 0.5,
  unit: [1, 0, -1],
};

class Program {
  constructor(player, vertText, fragText) {
    this.player = player;
    this.gl = player.gl;
    this.vertText = vertText;
    this.fragText = fragText;
    let gl = this.gl;
    this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.vertShader, vertText);
    gl.shaderSource(this.fragShader, fragText);
    gl.compileShader(this.vertShader);
    gl.compileShader(this.fragShader);
    gl.getShaderParameter(this.vertShader, gl.COMPILE_STATUS) || console.error(gl.getShaderInfoLog(this.vertShader));
    gl.getShaderParameter(this.fragShader, gl.COMPILE_STATUS) || console.error(gl.getShaderInfoLog(this.fragShader));
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertShader);
    gl.attachShader(this.program, this.fragShader);
    gl.linkProgram(this.program);

    this.textures = [];
    this.framebuffers = [];
    for (let i = 0; i < 2; i++) {
      let texture = gl.createTexture();
      let fb = gl.createFramebuffer();
      this.textures.push(texture);
      this.framebuffers.push(fb);
    };

    this.handleResize();
  }

  handleResize(ev) {
    let { gl } = this;
    for (let i = 0; i < 2; i++) {
      let [texture, fb] = [this.textures[i], this.framebuffers[i]];
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.player.w, this.player.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    };
  }

  setUniforms(uniforms) {
    let { gl, program } = this;
    gl.useProgram(this.program);
    for (let [key, value] of Object.entries(uniforms)) {
      let idx = gl.getUniformLocation(program, key);
      if (!value.length)
        value = [value];
      let type = typeof value[0] == 'boolean' ? 'i' : 'f';
      let fnKey = 'uniform%1%2v'.replace('%1', value.length).replace('%2', type);
      gl[fnKey](idx, value);
    }
  }

  setTextures(textures) {
    let { gl } = this;
    gl.useProgram(this.program);
    let entries = Object.entries(textures);
    entries.forEach(([uniformName, texture], idx) => {
      let enumKey = 'TEXTURE%'.replace('%', idx);
      let uniformLoc = gl.getUniformLocation(this.program, uniformName);
      gl.activeTexture(gl[enumKey]);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniformLoc, idx);
    });
  }
}

export default class Player {
  constructor(canvas, programDefs=PROGRAM_DEFS, uniformOverrides={}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2');
    this.programDefs = Object.assign({}, programDefs);
    this.uniforms = Object.assign({}, BASE_UNIFORMS, uniformOverrides);
    this.programs = [];
    this.counter = 0;

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
    this.buildPrograms(programDefs);
  }

  buildPrograms(programDefs) {
    this.SHADERS = SHADERS;
    this.programs = programDefs.map((programDef) => {
      let [vertSource, fragSource] = programDef.map((shaderDef) => {
        const shaderName = Array.isArray(shaderDef) ? shaderDef[0] : shaderDef;
        return SHADERS[shaderName];
      });
      let program = new Program(this, vertSource, fragSource);
      return program;
    });
  }

  setup() {
    let { gl } = this;
    let vertArray = new Float32Array([
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0,
    ]);

    let vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);

    for (let program of this.programs) {
      let vertPositionAttribute = gl.getAttribLocation(program.program, 'vertexPosition');
      gl.enableVertexAttribArray(vertPositionAttribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
      gl.vertexAttribPointer(vertPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    }

    this.interval = 50;
    this.counter = 0;
  }

  run() {
    let cur = this.counter % 2;
    let last = (cur + 1) % 2;
    let { gl } = this;
    let programCount = this.programs.length;

    this.uniforms.counter = this.counter++;
    this.uniforms.time = (this.uniforms.counter % this.uniforms.duration) / this.uniforms.duration;
    this.uniforms.clock = Date.now();

    for (let i = 0; i < programCount; i++) {
      let li = (i + programCount - 1) % programCount;
      let program = this.programs[i];
      let lastTexture = this.programs[i].textures[last];
      let inputTexture = this.programs[li].textures[cur];
      if (programCount > 1 && i == 0) {
        inputTexture = this.programs[programCount - 2].textures[last];
      }
      program.setTextures({inputTexture, lastTexture});
      program.setUniforms(this.uniforms);
      let framebuffer = i < programCount - 1 ? this.programs[i].framebuffers[cur] : null;

      gl.useProgram(program.program);
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  loop() {
    if (!this.playing) return;
    let now = Date.now();
    if (now >= this.last + this.interval) {
      this.last = now;
      this.run();
    }
    requestAnimationFrame(() => this.loop());
  }

  start(program) {
    this.playing = true;
    this.last = Date.now();
    this.setup();
    this.loop(program);
  }

  stop() {
    this.playing = false;
  }

  handleKey(ev) {
    let { uniforms } = this;
    let key = ev.key.toUpperCase();
    let uniformKey = `key${key}`;
    if ('WASD'.includes(key)) {
      if (ev.type == 'keydown') {
        uniforms[uniformKey] = true;
      }
      else if (ev.type == 'keyup') {
        uniforms[uniformKey] = false;
      }
    }
  }

  handlePointer(ev) {
    let { uniforms } = this;
    let pos = [
      ev.offsetX / this.dw * 2 - 1,
      ev.offsetY / this.dh * -2 + 1,
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

    uniforms.cursorAngle = Math.atan2(ev.offsetY, ev.offsetX);
  }

  handleResize(ev) {
    let dpr = window.devicePixelRatio;
    let [dw, dh] = [window.innerWidth, window.innerHeight];
    let [w, h] = [dw, dh].map((e) => Math.round(e * dpr));
    this.dw = dw;
    this.dh = dh;
    this.w = w;
    this.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.uniforms.size = [w, h];
    this.gl.viewport(0, 0, w, h);

    this.programs.forEach((e) => e.handleResize(ev));
  }

  handleScroll(ev) {
    this.scrollPos = window.scrollY / this.scrollRange;
    this.canvas.style.transform = `translateY(${(-this.parallaxRange * this.scrollPos).toFixed(2)}px)`;
  }
}
