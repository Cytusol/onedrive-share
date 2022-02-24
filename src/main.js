import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.js'
import pinia from './plugins/pinia.js'

Vue.config.productionTip = false

new Vue({
  pinia,
  vuetify,
  render: h => h(App)
}).$mount('#app')
