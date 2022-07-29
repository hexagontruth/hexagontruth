<script>
import Data from '../data.js';
import ShaderProgram from '../classes/shader-program.js';

const UNIFORMS = {
  pi: Math.PI,
  tau: Math.PI * 2,
  sr2: 2 ** 0.5,
  sr3: 3 ** 0.5,
  unit: [1, 0, -1],
  size: [0, 0],
  cover: [0, 0],
  contain: [0, 0],
  edgeStep: 0,
  time: 0,
  clock: Date.now(),
  counter: 0,
  duration: 360,
};

export default {
  props: {
    scrolling: { type: Boolean },
    scrollRatio: { type: Number },
    snap: { type: Number },
    lastSnap: { type: Number },
    nextSnap: { type: Number },
  },
  data() {
    return {
      playing: true,
      counter: 0,
      interval: 30,
      w: 0,
      h: 0,
    };
  },

  created() {
    window.test = this;
    this.uniforms = Object.assign({}, UNIFORMS);
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    let gl = this.gl = this.$refs.canvas.getContext('webgl2');

    this.shaderPrograms = Object.entries(Data.frames).map(([_, data]) => {
      return data.shaders.map((e) => new ShaderProgram(gl, e));
    });
    this.panelCount = this.shaderPrograms.length;
    this.blendProgram = new ShaderProgram(gl, Data.shaders.blend);


    this.onResize = (ev) => this.handleResize(ev);
    window.addEventListener('resize', this.resizeListener);
    this.handleResize();

    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.start();
  },

  unmounted() {
    window.removeEventListener('resize', this.onResize);
    this.playing = false;
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

      for (let programFrame of this.shaderPrograms) {
        for (let shaderProgram of programFrame) {
          let vertPositionAttribute = gl.getAttribLocation(shaderProgram.program, 'vertexPosition');
          gl.enableVertexAttribArray(vertPositionAttribute);
          gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
          gl.vertexAttribPointer(vertPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        }
      }
    },

    run() {
      if (this.scrolling) {
        this.runPrograms(this.shaderPrograms[this.snap]);

      }
      else {
        this.runPrograms([].concat(
          this.shaderPrograms[this.lastSnap],
          [this.blendProgram],
          this.shaderPrograms[this.nextSnap],
        ));
      }

    },

    runPrograms(shaderPrograms, final=true) {
      // console.log(this.scrolling, shaderPrograms.length);
      let { gl, panelCount, uniforms } = this;
      let programCount = shaderPrograms.length;
      let cur = this.counter % 2;
      let last = (cur + 1) % 2;

      uniforms.counter = this.counter++;
      uniforms.time = (uniforms.counter % uniforms.duration) / uniforms.duration;
      uniforms.clock = Date.now();
      uniforms.scrolling = this.scrolling;
      uniforms.scrollRatio = this.scrollRatio;

      for (let i = 0; i < programCount; i++) {
        let li = (i + programCount - 1) % programCount;
        let shaderProgram = shaderPrograms[i];
        uniforms.lastTexture = shaderPrograms[i].textures[last];
        uniforms.inputTexture = shaderPrograms[li].textures[cur];
        if (programCount > 1 && i == 0) {
          uniforms.inputTexture = shaderPrograms[programCount - 2].textures[last];
        }

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
        this.uniforms.contain = [w / h, 1];
        this.uniforms.cover = [1, h / w];
      }
      else {
        this.uniforms.contain = [1, h / w];
        this.uniforms.cover = [w / h, 1];
      }
      // Smoothstep pixel size Relative to contain
      this.uniforms.edgeStep = 2 / Math.min(w, h);

      this.shaderPrograms?.forEach((e) => e.forEach((e) => e.handleResize(w, h)));
      this.gl.viewport(0, 0, w, h);
    },
  },
};
</script>

<template>
  <div class="program-wrapper">
    <canvas class="canvas" ref="canvas"></canvas>
  </div>
</template>
