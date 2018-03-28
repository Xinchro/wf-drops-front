import Vue from "vue"
import VueRouter from "vue-router"
import infiniteScroll from "vue-infinite-scroll"
import routes from "./routes.js"

// components
import wffooter from "./components/footer.vue"
import wfheader from "./components/header.vue"

Vue.use(VueRouter)
Vue.use(infiniteScroll)

Vue.component('wf-header', wfheader)
Vue.component('wf-footer', wffooter)

const router = new VueRouter({
  routes: routes
})

const app = new Vue({
  el: "#app",
  router
})

window.app = app