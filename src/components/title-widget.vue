<script>
export default {
  props: {
  },

  created() {
    this.timer = null;
    this.titleText = 'Hexagon Truth';
  },

  data() {
    return {};
  },

  methods: {
    animate(initialInterval=600, interval=200) {
      this.$refs.title.innerHTML = '';
      this.timer = this.timer || setTimeout(() => this.step(interval), initialInterval);

    },
    step(interval) {
      let cur = this.$refs.title.innerHTML;
      let next = this.titleText.slice(0, cur.length + 1);
      this.$refs.title.innerHTML = next;
      this.timer = null;
      if (next.length < 13)
        this.timer = setTimeout(() => this.step(interval), interval);
    }
  },
};
</script>

<template>
  <div class="title-wrapper">
    <h1 ref="title">
      Hexagon Truth
    </h1>
  </div>
</template>
