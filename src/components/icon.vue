<script>
const ICONS = {};
function importAll(ctx) {
  let container = document.createElement('div');
  container.style.display = 'none';

  ctx.keys().forEach((key) => {
    let name = key.match(/^.*?([\w-]+)\.svg$/)?.[1];
    let str = ctx(key);
    str = str.match(/\<svg.*?\>.*?\<\/svg\>/);
    container.innerHTML = container.innerHTML + str;
    container.lastChild.id = `icon-${name}`;
    ICONS[name] = container.lastChild;
  });
  document.body.appendChild(container);
}

importAll(require.context('../icons/', false, /\.svg$/));

export default {
  props: {
    name: { type: String },
  },
  
  data() {
    return {
      iconId: `#icon-${this.name.toLowerCase()}`,
    };
  },
};
</script>

<template>
  <svg class="icon"><use :href="iconId"/></svg>
</template>
