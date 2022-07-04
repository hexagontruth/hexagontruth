<script>
export default {
  props: {
    title: { type: String },
    page: { type: String },
  },
  data: () => ({
  }),
};
</script>

<template>
  <div class="page-widget-wrapper" :id="'page-' + page">

  </div>
</template>
