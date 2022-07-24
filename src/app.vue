<script>
import Data from './data.js';
import FooterIcon from './components/footer-icon.vue';
import Frame from './components/frame.vue';
import PageButton from './components/page-button.vue';
import Program from './components/program.vue';
import TitleWidget from './components/title-widget.vue';

export default {
  components: { Data, FooterIcon, Frame, PageButton, Program, TitleWidget },

  created() {
    window.addEventListener('scroll', (ev) => this.handleScroll(ev));
    window.addEventListener('wheel', (ev) => this.handleWheel(ev), { passive: false });
  },

  mounted() {
    this.handleScroll();
  },

  data() {
    return {
      snap: this.getSnap(),
      scrolling: null,
      frameData: Object.entries(Data.frames).map(([k, v]) => Object.assign({name: k}, v)),
    };
  },

  methods: {
    handleScroll(ev) {
      if (!this.$refs.frames) return;
      let cur = this.$refs.frames.map((e) => e.$el).findIndex((e) => this.eq(e.offsetTop));
      if (cur != -1) {
        this.setSnap(cur);
      }
      if (this.scrolling)
        window.clearTimeout(this.scrolling);
      this.scrolling = setTimeout(() => this.scrolling = null, 250);
    },

    handleWheel(ev) {
      if (!this.$refs.frames) return;
      let pts = this.$refs.frames.map((e) => e.$el.offsetTop);
      let newY = window.scrollY;
      let nextPoint;
      if (ev.deltaY > 0) {
        nextPoint = pts.find((e) => !this.eq(e, pts[this.snap]) && e > newY);
      }
      else {
        nextPoint = pts.slice().reverse().find((e) => !this.eq(e, pts[this.snap]) && e < newY);
      }
      nextPoint != null && window.scrollTo(0, nextPoint);
      ev.preventDefault();
    },

    setSnap(n) {
      let snap = this.getSnapObject();
      snap[window.location.pathname] = n;
      this.snap = parseInt(snap[window.location.pathname]) || 0;
      sessionStorage.setItem('snap', JSON.stringify(snap));
    },

    getSnap() {
      let snap = this.getSnapObject();
      return  snap[window.location.pathname] || 0;
    },

    getSnapObject() {
      let str = sessionStorage.getItem('snap');
      return str ? JSON.parse(str) : {};
    },
    
    snapTo(idx) {
      let y = this.$refs.frames[idx]?.$el.offsetTop || 0;
      window.scrollTo(0, y);
    },

    eq(y) {
      return Math.abs(window.scrollY - y) < 5; 
    },
  }
};
</script>

<template>
  <header id="header">
    <title-widget :snap="snap" :scrolling="scrolling"/>
    <div class="wrapper">
      <div class="page-buttons-wrapper">
        <page-button v-for="(frame, idx) in frameData" ref="pageButtons" :snap="snap" :idx="idx"/>
      </div>
    </div>
  </header>
  <main id="main">
    <program name="background"></program>
    <program name="panel"></program>
    <div class="wrapper">
      <div id="content" class="content-wrapper">
        <frame v-for="(frame, idx) in frameData" ref="frames" :data="frame" :idx="idx" :class="{ 'active': idx == 0 }"></frame>
      </div>
    </div>
  </main>
  <footer id="footer">
    <div class="wrapper">
      <ul class="footer-icons-wrapper">
        <footer-icon name="Twitter"/>
        <footer-icon name="Instagram"/>
        <footer-icon name="YouTube"/>
        <footer-icon name="Discord"/>
        <footer-icon name="SuperRare"/>
        <footer-icon name="OpenSea"/>
        <footer-icon name="Voxels"/>
      </ul>
    </div>
  </footer>
</template>
