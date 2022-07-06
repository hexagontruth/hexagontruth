<script>
export default {
  props: {
    data: { type: Object },
  },
  data() {
    return {};
  },
};
</script>

<template>
  <div class="page-widget-wrapper">
    <div v-for="frame in data" class="page-button"></div>
  </div>
</template>
