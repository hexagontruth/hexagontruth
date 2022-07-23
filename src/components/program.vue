<script>
import Data from '../data.js';
import ShaderProgram from '../classes/shader-program.js';

// TODO: Something better than this
const SHADERS = {
  vs: require('../shaders/default.vs'),
  background1: require('../shaders/background1.fs'),
  panel1: require('../shaders/panel1.fs'),
};

const UNIFORMS = {
  pi: Math.PI,
  tau: Math.PI * 2,
  sr2: 2 ** 0.5,
  sr3: 3 ** 0.5,
  unit: [1, 0, -1],
  size: [0, 0],
  cover: 0,
  contain: 0,
  time: 0,
  clock: Date.now(),
  counter: 0,
  duration: 360,
};

export default {
  props: {
    name: { type: String },
  },
  data() {
    return {
      program: Data.programs[this.name],
      playing: true,
      counter: 0,
      interval: 30,
      w: 0,
      h: 0,
    };
  },

  created() {
    this.shaderText = this.program.shaders.map((e) => SHADERS[e]);
    this.programCount = this.shaderText.length;
    this.uniforms = Object.assign({}, UNIFORMS, this.program.uniforms || {});
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    let gl = this.gl = this.$refs.canvas.getContext('webgl2');

    this.shaderPrograms = this.shaderText.map((fragText) => {
      let shaderProgram = new ShaderProgram(gl, SHADERS.vs, fragText);
      return shaderProgram;
    });

    this.resizeListener = (ev) => this.handleResize(ev);
    window.addEventListener('resize', this.resizeListener);
    this.handleResize();

    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.start();
  },

  unmounted() {
    window.removeEventListener('resize', this.resizeListener);
  },

  methods: {
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

      for (let shaderProgram of this.shaderPrograms) {
        let vertPositionAttribute = gl.getAttribLocation(shaderProgram.program, 'vertexPosition');
        console.log('wedge', shaderProgram.program, vertPositionAttribute);
        gl.enableVertexAttribArray(vertPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.vertexAttribPointer(vertPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      }
    },

    run() {
      let { gl, programCount, shaderPrograms, uniforms } = this;
      let cur = this.counter % 2;
      let last = (cur + 1) % 2;

      uniforms.counter = ++this.counter;
      uniforms.time = (uniforms.counter % uniforms.duration) / uniforms.duration;
      uniforms.clock = Date.now();

      for (let i = 0; i < programCount; i++) {
        let li = (i + programCount - 1) % programCount;
        let shaderProgram = shaderPrograms[i];
        uniforms.lastTexture = shaderPrograms[i].textures[last];
        uniforms.inputTexture = shaderPrograms[li].textures[cur];
        if (programCount > 1 && i == 0) {
          uniforms.inputTexture = shaderPrograms[programCount - 2].textures[last];
        }
        window.test = uniforms;
        shaderProgram.setUniforms(uniforms);
        let framebuffer = i < programCount - 1 ? shaderPrograms[i].framebuffers[cur] : null;
        gl.useProgram(shaderProgram.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    },

    loop() {
      if (!this.playing) return;
      let now = Date.now();
      if (now >= this.last + this.interval) {
        this.last = now;
        this.run();
      }
      requestAnimationFrame(() => this.loop());
    },

    start() {
      this.playing = true;
      this.last = Date.now();
      this.setup();
      this.loop();
    },

    stop() {
      this.playing = false;
    },

    handleResize(ev) {
      let dpr = window.devicePixelRatio || 1;
      let coef = dpr * 1;
      let [w, h] = [window.innerWidth * coef, window.innerHeight * coef];
      this.w = w;
      this.h = h;
      this.canvas.width = w;
      this.canvas.height = h;

      this.uniforms.size = [w, h];
      if (w > h) {
        this.uniforms.contain = h;
        this.uniforms.cover = w;
      }
      else {
        this.uniforms.contain = w;
        this.uniforms.cover = h;
      }
      this.shaderPrograms?.forEach((e) => e.handleResize(w, h));
      this.gl.viewport(0, 0, w, h);
    },
  },
};
</script>

<template>
  <div class="program-wrapper">
    <canvas class="canvas" :id="`canvas-${name}`" ref="canvas"></canvas>
  </div>
</template>
