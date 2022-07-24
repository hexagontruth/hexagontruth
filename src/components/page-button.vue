<script>
import Frame from './frame.vue';

export default {
  props: {
    snap: { type: Number },
    idx: { type: Number },
  },
  data() {
    return {};
  },

  mounted() {
    this.update();
  },

  watch: {
    snap(newSnap, oldSnap) {
      this.update();
    },
  },

  methods: {
    handleClick(ev) {
      this.$parent.snapTo(this.idx);
    },

    update() {
      this.$el.classList.toggle('active', this.idx == this.snap);
    }
  }
};
</script>

<template>
  <div class="page-button" @click="handleClick">
    <div class="page-button-inner"></div>
  </div>
</template>
