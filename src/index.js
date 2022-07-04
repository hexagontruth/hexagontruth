import { createApp } from 'vue';

import './styles/style.scss';
import Page from './classes/page.js';
import App from './app.vue';

import Data from './data.js';

window.app = createApp(App);
window.app.mount('#app');
