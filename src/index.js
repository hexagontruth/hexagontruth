import { createApp } from 'vue';

import './styles/style.scss';

import App from './app.vue';

window.app = createApp(App);
window.app.mount('#app');
