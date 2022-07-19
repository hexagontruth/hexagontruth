<script>
export default {
  props: {
    snap: { type: Number },
    scrolling: { type: Number },
  },

  created() {
    this.timer = null;
    this.titleText = 'Hexagon Truth';
    this.numChars = 12;
    this.visibleChars = this.numChars;
  },

  mounted() {
    this.clear();
    this.animate();
  },

  data() {
    return {};
  },

  watch: {
    scrolling() {
      if (!this.scrolling)
        this.animate();
      else
        this.clear();

    },
  },

  methods: {
    clear() {
      this.$refs.title.className = 'show-0';
      this.visibleChars = 0;
    },

    animate(initialInterval=750, interval=500) {
      this.timer = this.timer || setTimeout(() => this.step(interval), initialInterval);

    },

    step(interval) {
      this.$refs.title.className = `show-${++this.visibleChars}`;
      this.timer = null;
      if (this.visibleChars < 12)
        this.timer = setTimeout(() => this.step(interval), interval);
    }
  },
};
</script>

<template>
  <div class="title-wrapper">
    <h1 ref="title">
      <span>H</span>
      <span>e</span>
      <span>x</span>
      <span>a</span>
      <span>g</span>
      <span>o</span>
      <span>n</span>
      <span>T</span>
      <span>r</span>
      <span>u</span>
      <span>t</span>
      <span>h</span>
    </h1>
  </div>
</template>
