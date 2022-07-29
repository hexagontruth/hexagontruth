<script>
import Data from './data.js';
import FooterIcon from './components/footer-icon.vue';
import Frame from './components/frame.vue';
import PageButton from './components/page-button.vue';
import Program from './components/program.vue';
import TitleWidget from './components/title-widget.vue';

export default {
  components: { Data, FooterIcon, Frame, PageButton, Program, TitleWidget },

  data() {
    return {
      snap: this.getSnap(),
      lastSnap: 0,
      nextSnap: 0,
      scrolling: false,
      scrollTimer: null,
      scrollRatio: 0,
      lastScroll: 0,
      curScroll: 0,
      curFrame: null,
      frameData: Object.entries(Data.frames).map(([k, v]) => Object.assign({name: k}, v)),
    };
  },

  mounted() {
    this.onScroll = (ev) => this.handleScroll(ev);
    this.onWheel = (ev) => this.handleWheel(ev);
    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('wheel', this.onWheel, { passive: false });
    this.handleScroll();
  },

  unmounted() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('wheel', this.onWheel);
  },

  methods: {
    handleScroll(ev) {
      this.lastScroll = this.curScroll;
      this.curScroll = window.scrollY;
      if (!this.$refs.frames) return;

      let dif = this.curScroll - this.lastScroll;
      let frames = this.$refs.frames.map((e) => e.$el);
      let pts = frames.map((e) => e.offsetTop);

      let cur = pts.findIndex((e) => this.eq(e));
      // Set snap if scrolling is done
      if (cur != -1) {
        this.setSnap(cur);
      }
      // Find fractional position
      let last = pts[this.snap];
      let next = dif > 0 ?
        pts.find((e) => e > pts[this.snap]) :
        pts.slice().reverse().find((e) => e < pts[this.snap]);

      this.lastSnap = pts.indexOf(last);
      this.nextFrame = pts.indexOf(next);

      this.scrollRatio =
        Math.abs(last - this.curScroll) /
        (Math.abs(last - this.curScroll) + Math.abs(next - this.curScroll)) || 1;


      if (this.scrolling)
        window.clearTimeout(this.scrollTimer);
      this.scrolling = true;
      this.scrollTimer = setTimeout(() => {
        this.scrolling = false;
        this.scrollTimer = null;
      }, 250);
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

    eq(y, cur=this.curScroll) {
      return Math.abs(cur - y) < 5; 
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
    <program :scrolling="scrolling" :scrollRatio="scrollRatio" :snap="snap" :lastSnap="lastSnap" :nextSnap="nextSnap"></program>
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
