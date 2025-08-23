import { createRouter, createWebHashHistory } from 'vue-router'
import Weather from './apps/Weather.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./Shell.vue') },  // 空壳/欢迎
    { path: '/weather', component: Weather },
  ],
})
