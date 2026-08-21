// entry-window-manager.js
import { createApp } from 'vue'
import WindowManager from './desktop/WindowManager.vue'
// 不需要强制引入 store；先把页面恢复
import * as legacy from './stores/legacyWindow'

const app = createApp(WindowManager)
// 如果你的 WindowManager 用不到 provide 的 store，可先不 provide
// app.provide('windowStore', store)
const mountEl = document.querySelector('#window-root') || document.querySelector('#desktop-vue-root') || document.body
app.mount(mountEl)

// 只做桥接：旧 API 直接指向 legacy 的真实实现（保持原逻辑）
Object.assign(window, {
  // 旧世界 API
  openWindow             : legacy.openWindow,
  closeWindow            : legacy.closeWindow,
  closeTargetWindow      : legacy.closeTargetWindow,
  minimizeTargetWindow   : legacy.minimizeTargetWindow,
  maximizeTargetWindow   : legacy.maximizeTargetWindow,
  bindWindowBehavior     : legacy.bindWindowBehavior,
  showWindowContextMenu  : legacy.showWindowContextMenu,
  hideWindowContextMenu  : legacy.hideWindowContextMenu,
  removeTaskbarIcon      : legacy.removeTaskbarIcon,

  // 若你有 WW.windows 的历史依赖，可以先不暴露；等一切恢复再决定是否接入 store
  // WW: { ...(window.WW || {}), windows: store },
})

window.dispatchEvent(new Event('ww-wm-ready'))
