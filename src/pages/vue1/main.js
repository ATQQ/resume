import Vue from 'vue'
import App from './App.vue'
import './index.scss'

Vue.config.productionTip = process.env.NODE_ENV === 'development'

new Vue({
  render: (h) => h(App),
}).$mount('#app')
