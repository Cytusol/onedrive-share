import Vue from 'vue';
import { createPinia, PiniaVuePlugin } from 'pinia'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

Vue.use(PiniaVuePlugin);
export default pinia;
