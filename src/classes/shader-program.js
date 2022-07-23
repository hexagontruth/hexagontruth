import HexagonError from './hexagon-error.js';

export default class Program {
  constructor(gl, vertText, fragText) {
    this.gl = gl;
    this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.vertShader, vertText);
    gl.shaderSource(this.fragShader, fragText);
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
    this.w = w;
    this.h = h;
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

  setUniforms(uniforms) {
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
