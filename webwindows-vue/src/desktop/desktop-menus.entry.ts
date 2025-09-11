import { createApp } from 'vue'
import DesktopContextMenus from './DesktopContextMenus.vue'

const ctx: Record<string, { app?: ReturnType<typeof createApp> }> = {}

function mount(target: string | Element = 'body', key = 'default') {
  const el = typeof target === 'string' ? document.querySelector(target)! : target
  if (!el) throw new Error('[DesktopMenus] mount target not found')
  if (ctx[key]?.app) unmount(key)
  const app = createApp(DesktopContextMenus)
  app.mount(el)
  ctx[key] = { app }
}

function unmount(key = 'default') {
  const entry = ctx[key]
  if (entry?.app) { entry.app.unmount(); delete ctx[key] }
}

;(window as any).DesktopMenusWidget = { mount, unmount }
export default { mount, unmount }
