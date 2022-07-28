<script>
import Data from '../data.js';
import FooterIcon from './footer-icon.vue';

export default {
  components: { FooterIcon },
  props: {
    data: { type: Object },
    idx: { type: Number },
    key: { type: String },
  },

  data() {
    return {};
  },
};
</script>

<template>
  <section class="frame-wrapper" :id="`panel-${data.name}`">
    <div class="frame-outer">
      <div class="frame-inner">
        <section v-for="text in data.content" v-html="text">
        </section>
      </div>
    </div>
  </section>
</template>
