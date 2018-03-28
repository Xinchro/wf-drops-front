import Vue from "vue"
import VueRouter from "vue-router"
import infiniteScroll from "vue-infinite-scroll"
import routes from "./routes.js"

Vue.use(VueRouter)
Vue.use(infiniteScroll)

const router = new VueRouter({
  routes: routes
})

const app = new Vue({
  el: "#app",
  router
})

window.app = app
