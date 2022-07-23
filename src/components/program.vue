<script>
import Data from '../data.js';
import ShaderProgram from '../classes/shader-program.js';

// TODO: Something better than this
const SHADERS = {
  vs: require('../shaders/default.vs'),
  background1: require('../shaders/background1.fs'),
};

export default {
  props: {
    name: { type: String },
  },
  data() {
    return {
      program: Data.programs[this.name],
      counter: 0,
      interval: 25,
      uniforms: {
        uSize: [0, 0],
        uCover: 0,
        uContain: 0,
        uTime: 0,
        uCounter: 0,
        uDuration: 0,
      },
      w: 0,
      h: 0,
    };
  },

  created() {
    this.shaderText = this.program.shaders.map((e) => SHADERS[e]);
    this.shaderCount = this.shaderText.length;
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    this.gl = this.$refs.canvas.getContext('webgl2');

    this.shaderPrograms = this.shaderText.map((fragText) => {
      let shaderProgram = new ShaderProgram(this.gl, SHADERS.vs, fragText);
      return shaderProgram;
    });

    this.resizeListener = (ev) => this.handleResize(ev);
    window.addEventListener('resize', this.resizeListener);
    this.handleResize();
  },

  unmounted() {
    window.removeEventListener('resize', this.resizeListener);
  },

  methods: {
    setup() {
    let {gl} = this;
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
        gl.enableVertexAttribArray(vertPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.vertexAttribPointer(vertPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      }

      this.interval = 50;
      this.counter = 0;
    },

    handleResize(ev) {
      let [w, h] = [window.innerWidth, window.innerHeight];
      this.w = w;
      this.h = h;
      this.canvas.width = w;
      this.canvas.height = h;

      this.uniforms.uSize = [w, h];
      if (w > h) {
        this.uniforms.uContain = h;
        this.uniforms.uCover = w;
      }
      else {
        this.uniforms.uContain = w;
        this.uniforms.uCover = h;
      }
      this.shaderPrograms?.forEach((e) => e.handleResize(w, h));
    },
  },
};
</script>

<template>
  <div class="program-wrapper">
    <canvas class="canvas" :id="`canvas-${name}`" ref="canvas"></canvas>
  </div>
</template>
