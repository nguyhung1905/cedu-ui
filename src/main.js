import Vue from 'vue'
import App from './App.vue'
import router from "@/router/router";
import store from "@/store";
import '@/config/bootstrap-vue'
Vue.config.productionTip = false
import '@/permission'
import GSignInButton from 'vue-google-signin-button'
Vue.use(GSignInButton)
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})