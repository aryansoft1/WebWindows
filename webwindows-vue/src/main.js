import { createApp } from 'vue'
import App from './App.vue'
import { installOpenWindowBridge } from './bridge/openWindowBridge'

installOpenWindowBridge()  // ⭐ 挂载 window.openWindow

createApp(App).mount('#app')
