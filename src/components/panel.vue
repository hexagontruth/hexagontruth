<script>
import Data from '../data.js';

export default {
  props: {
    item: { type: Object },
    idx: { type: Number },
    key: { type: String },
  },
  data() {
    let content = this.item.content || [];
    return { content };
  },
};
</script>

<template>
  <div class="panel-wrapper" :id="`panel-${item.name}`">
    <p v-for="text in content">
      {{text}}
    </p>
    <ul class="panel-links" v-if="item.links">
      <li v-for="link in item.links" :link="link">
        {{link}}
      </li>
    </ul>
  </div>
</template>
