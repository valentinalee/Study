import Vue from 'vue'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'

import 'element-ui/lib/theme-default/index.css'

import auth from './auth'
import App from './App'

import Layout from './components/Layout.vue'
import Search from './components/Search.vue'
import Editor from './components/Editor.vue'

import routes from './router-config'

import store from './store'

Vue.component(Layout.name, Layout)
Vue.component(Search.name, Search)
Vue.component(Editor.name, Editor)

Vue.use(ElementUI)
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes
})

router.beforeEach((to, from, next) => {
  if (!auth.loggedIn() && to.name !== 'login') {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  router,
  store,
  components: { App }
})
