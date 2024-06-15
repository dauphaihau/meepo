import { createApp } from 'vue';
import FloatingVue, { VTooltip } from 'floating-vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import '@/assets/main.css';
import '@/assets/tooltip.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.directive('tooltip', VTooltip);

app.use(pinia);
app.use(FloatingVue);
app.use(VueQueryPlugin);

app.use(router);
app.mount('#app');
