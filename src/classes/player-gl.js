
import Player from './player.js';
import ShaderProgram from './shader-program.js';
import webglUtils from '../webgl-utils.js';

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

export default class PlayerGL extends Player {
  constructor(page, name, canvas, config) {
    super(page, name, canvas, config);

    this.gl = canvas.getContext('webgl2');
    this.shaderDefs = this.config.shaders;
    this.uniforms = Object.assign({}, BASE_UNIFORMS, this.config.uniforms);
    this.shaderPrograms = [];
    this.customInputKeys = [];
    this.customInput = {};
    this.customTextures = {};

    if (this.config.size && !isNaN(this.config.size)) {
      this.config.size = [this.config.size, this.config.size];
    }
    this.shaderPrograms = ShaderProgram.build(this, this.shaderDefs);

    this.handleResize();
    this.handleScroll();
    this.clear();
  }

  initialize() {
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

  reset() {
    super.reset();
    this.uniforms.resize = true;
    this.uniforms.dir = [0, 0];
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
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.width, src.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    });

    const textureArray = this.shaderPrograms.map((program) => {
      return program.getTexture(last);
    });
    
    for (let i = 0; i < programCount; i++) {
      const li = (i + programCount - 1) % programCount;
      const program = shaderPrograms[i];
      uniforms.lastSize = uniforms.size.slice();
      uniforms.size = program.size || this.size;
      uniforms.cover = program.cover;
      uniforms.contain = program.contain;
      uniforms.aspect = program.aspect;

      const lastTexture = program.getTexture(last);
      let inputTexture = shaderPrograms[li].getTexture(cur);
      if (programCount > 1 && i == 0) {
        // This assumes a final top shader layer not fed back to the bottom
        inputTexture = shaderPrograms[programCount - 2].textures[last];
      }

      program.setTextures({inputTexture, lastTexture, textureArray, ...this.customTextures});
      program.setUniforms(uniforms);

      const framebuffer = i < programCount - 1 ? program.getFramebuffer(cur) : null;

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

  handleScroll(ev) {
    super.handleScroll(ev);

    this.uniforms.resize = true;
    this.uniforms.resizeAt = true;
    this.gl.viewport(0, 0, this.w, this.h);
    this.shaderPrograms.forEach((e) => e.handleResize(ev));
  }
}
