<script>
import Data from '../data.js';

export default {
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
        <p v-for="text in data.content">
          {{text}}
        </p>
        <ul class="frame-links" v-if="data.links">
          <li v-for="link in data.links" :link="link">
            {{link}}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
