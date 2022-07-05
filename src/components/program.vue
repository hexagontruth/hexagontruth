<script>

export default {
  props: {
    name: { type: String },
    data: { type: Object },
    idx: { type: Number },
  },
  data() {
    return {};
  },
};
</script>

<template>
  <div class="program-wrapper">
    <canvas class="canvas" :id="`canvas-${name}`"></canvas>
  </div>
</template>
