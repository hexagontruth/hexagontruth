<script>
import Data from './data.js';
import PageWidget from './components/page-widget.vue';
import Panel from './components/panel.vue';

export default {
  components: { Data, PageWidget, Panel },
  data: () => ({
    panels: Data.panels
  }),
};

console.log(JSON.stringify(Data.panels));
</script>

<template>
  <header id="header">
    <page-widget/>
  </header>
  <main id="main">
    <canvas id="background"></canvas>
    <section id="content" class="content-wrapper">
      <panel v-for="(panel, idx) in panels" :item="panel" :idx="idx"></panel>
    </section>
  </main>
  <footer id="footer">
  </footer>
</template>
