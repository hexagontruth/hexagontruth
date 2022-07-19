<script>
import Data from '../data.js';
import Frame from './frame.vue';

export default {
  props: {
    name: { type: String },
  },
  data() {
    return Data.links[this.name];
  },

  methods: {
  },
};
</script>

<template>
  <li class="footer-icon">
    <a :href="url" :title="name" target="_blank">
      <i :class="`icon-${icon}`"></i>
    </a>
  </li>
</template>
