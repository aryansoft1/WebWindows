// webwindows-vue/src/entry-window-manager.js
import { createApp } from 'vue'
import WindowManager from './desktop/WindowManager.vue'
import * as legacy from './stores/legacyWindow'

// 只导出 mount，严格模式：不自动挂载、不自动补正；由 main.js 决定何时挂载
export function mount(target = '#desktop-vue-root') {
  // 兼容旧全局调用：继续用原始 openWindow/closeWindow 的实现
  window.openWindow  = legacy.openWindow
  window.closeWindow = legacy.closeWindow
  window.minimizeTargetWindow = legacy.minimizeTargetWindow
  window.maximizeTargetWindow = legacy.maximizeTargetWindow
  window.closeTargetWindow = legacy.closeTargetWindow
  window.toggleMaximizeWindow = legacy.toggleMaximizeWindow

  const root = typeof target === 'string' ? document.querySelector(target) : target
  if (!root) throw new Error('mount target not found: ' + target)
  const app = createApp(WindowManager)
  app.mount(root)
  return app
}
