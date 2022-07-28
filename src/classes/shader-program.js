import HexagonError from './hexagon-error.js';

// TODO: Something better than this
const SHADERS = {
  vs: require('../shaders/default.vs'),
  background1: require('../shaders/background1.fs'),
  'background-ca': require('../shaders/background-ca.fs'),
  panel1: require('../shaders/panel1.fs'),
};

export default class Program {
  constructor(gl, fragDef) {
    this.setShaderDefs(fragDef);
    this.gl = gl;
    this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.vertShader, this.vertText);
    gl.shaderSource(this.fragShader, this.fragText);
    gl.compileShader(this.vertShader);
    gl.compileShader(this.fragShader);
    gl.getShaderParameter(this.vertShader, gl.COMPILE_STATUS) || this.error(gl.getShaderInfoLog(this.vertShader));
    gl.getShaderParameter(this.fragShader, gl.COMPILE_STATUS) || this.error(gl.getShaderInfoLog(this.fragShader));
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

  handleResize(w, h) {
    [this.w, this.h] = [w, h] = this.options?.dim || [w, h];
    let {gl} = this;
    for (let i = 0; i < 2; i++) {
      let [texture, fb] = [this.textures[i], this.framebuffers[i]];
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    };
  }

  setShaderDefs(fragDef) {
    this.vertText = SHADERS['vs'];
    if (Array.isArray(fragDef)) {
      this.fragText = SHADERS[fragDef[0]];
      this.options = fragDef[1];
    }
    else {
      this.fragText = SHADERS[fragDef];
      this.options = {};
    }
  }

  setUniforms(uniforms) {
    uniforms = Object.assign({}, uniforms);
    if (this.options?.dim) {
      uniforms.contain = [1, 1];
      uniforms.cover = [1, 1];
      uniforms.size = this.options.dim.slice();
    }
    let { gl, program } = this;
    let textureIdx = 0;
    let textureMap = new Map();
    gl.useProgram(this.program);
    let primitives = [], textures = [];
    for (let [key, value] of Object.entries(uniforms)) {
      value = Array.isArray(value) ? value : [value];
      if (value[0] == null) continue;
      if (value[0] instanceof WebGLTexture)
        textures.push([key, value]);
      else
        primitives.push([key, value]);
    }

    for (let [key, value] of textures) {
      let idx = gl.getUniformLocation(program, key);
      let cur = textureMap.get(value[0]);
      let ptrArray = []
      for (let texture of value) {
        let ptr = textureMap.get(texture);
        if (!ptr) {
          ptr = textureIdx++;
          textureMap.set(texture, ptr);
          this.setTexture(texture, ptr);
        }
        ptrArray.push(ptr);
      }

      gl.uniform1iv(idx, ptrArray);
    }

    for (let [key, value] of primitives) {
      let idx = gl.getUniformLocation(program, key);
      let length = value.length;
      if (length > 4) {
        length = 1;
      }
      let type = typeof value[0] == 'boolean' ? 'i' : 'f';
      let fnKey = 'uniform%1%2v'.replace('%1', length).replace('%2', type);
      gl[fnKey](idx, value);
    }
  }

  setTexture(texture, idx) {
    let { gl } = this;
    let enumKey = 'TEXTURE%'.replace('%', idx);
    gl.activeTexture(gl[enumKey]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  clearTextures() {
    let { gl } = this;
    for (let i = 0; i < 2; i++) {
      let texture = this.textures[i];
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
  }

  error(msg) {
    window.shaderText = this.fragText;
    throw new HexagonError(msg);
  }
}
