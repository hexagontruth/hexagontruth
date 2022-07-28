<script>
import Data from '../data.js';
import Icon from './icon.vue';

export default {
  components: { Icon },

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
      <icon :name="name"/>
    </a>
  </li>
</template>
