<script>
import Data from './data.js';
import Frame from './components/frame.vue';
import PageWidget from './components/page-widget.vue';
import Program from './components/program.vue';
import TitleWidget from './components/title-widget.vue';

export default {
  components: { Data, Frame, PageWidget, Program, TitleWidget },

  created() {
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));
    window.addEventListener('wheel', (ev) => this.handleWheel(ev), { passive: false });
  },

  data() {
    return {
      frames: Data.frames
    };
  },

  methods: {
    handleScroll(ev) {
      let cur = this.$refs.frames.map((e) => e.$el).findIndex((e) => this.eq(e.offsetTop));
      if (cur != -1) {
        this.setSnap(cur);
      }
      
    },

    handleWheel(ev) {
      let pts = this.$refs.frames.map((e) => e.$el.offsetTop);
      let newY = window.scrollY;
      let nextPoint;
      if (ev.deltaY > 0) {
        nextPoint = pts.find((e) => !this.eq(e, pts[this.getSnap()]) && e > newY);
      }
      else {
        nextPoint = pts.slice().reverse().find((e) => !this.eq(e, pts[this.getSnap()]) && e < newY);
      }
      nextPoint != null && window.scrollTo(0, nextPoint);
      ev.preventDefault();
    },

    setSnap(n) {
      let snap = this.getSnapObject();
      snap[window.location.pathname] = n;
      sessionStorage.setItem('snap', JSON.stringify(snap));
    },

    getSnap() {
      let snap = this.getSnapObject();
      return parseInt(snap[window.location.pathname]) || 0;
    },

    getSnapObject() {
      let str = sessionStorage.getItem('snap');
      return str ? JSON.parse(str) : {};
    },

    eq(y) {
      return Math.abs(window.scrollY - y) < 5; 
    },
  }
};
</script>

<template>
  <header id="header">
    <page-widget/>
    <title-widget/>
  </header>
  <main id="main">
    <program name="background"></program>
    <div id="content" class="content-wrapper">
      <frame v-for="(frame, idx) in frames" ref="frames" :data="frame" :idx="idx" :class="{ 'active': idx == 0 }"></frame>
    </div>
  </main>
  <footer id="footer">
  </footer>
</template>
