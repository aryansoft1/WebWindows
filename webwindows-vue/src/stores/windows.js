// webwindows-vue/src/stores/windows.js
import * as legacy from './legacyWindow'
import { reactive } from 'vue'

export function createWindowStore() {
  const state = reactive({
    windows: [],              // [{id, appId, title, url, iconUrl, minimized, maximized}]
    activeId: null
  })

  function ensure(id, patch = {}) {
    let w = state.windows.find(x => x.id === id)
    if (!w) {
      w = { id, appId: id, title: id, url: '', iconUrl: '', minimized: false, maximized: false }
      state.windows.push(w)
    }
    Object.assign(w, patch)
    return w
  }

  // 统一入口（页面/右键/图标都会调到这里）
  function openWindow(appId, opt = {}) {
    const id       = opt.id || appId
    const title    = opt.title ?? appId
    const url      = opt.url ?? ''
    const iconUrl  = opt.iconUrl || ''
    const useIframe= opt.useIframe ?? true
    const type     = opt.type || ''
    const width    = opt.width || '900px'
    const height   = opt.height || '640px'

    // 交给 legacy 执行真实 DOM 行为（保持你原风格与逻辑）
    legacy.openWindow(id, title, url, iconUrl, useIframe, type, width, height)

    // 同步任务栏状态
    ensure(id, { appId, title, url, iconUrl, minimized: false })
    state.activeId = id
    return id
  }

  function closeWindow(id) {
    legacy.closeWindow(id)
    const i = state.windows.findIndex(x => x.id === id)
    if (i > -1) state.windows.splice(i, 1)
    if (state.activeId === id) state.activeId = state.windows.at(-1)?.id || null
  }

  function toggleMin(id) {
    const w = ensure(id)
    w.minimized = !w.minimized
    legacy.minimizeTargetWindow(id)   // 真实行为仍由 legacy 执行
    if (w.minimized) {
      if (state.activeId === id) state.activeId = null
    } else {
      state.activeId = id
    }
  }

  function toggleMax(id) {
    const w = ensure(id)
    w.maximized = !w.maximized
    legacy.maximizeTargetWindow(id)
  }

  function focus(id) {
    ensure(id)
    state.activeId = id
    // 如果你在 legacy 里有 focusTargetWindow，可在此调用；没有就靠点击时的逻辑
    // legacy.focusTargetWindow?.(id)
  }

  return { state, openWindow, closeWindow, toggleMin, toggleMax, focus }
}

// 单例（组件与入口都用这一份）
export const windowsStore = createWindowStore()
export default windowsStore
