import assert from 'node:assert/strict'

const storage = new Map()
const workspaceEvents = []
const widgetEvents = []
globalThis.localStorage = {
  getItem(key) { return storage.get(key) ?? null },
  setItem(key, value) { storage.set(key, String(value)) },
  removeItem(key) { storage.delete(key) }
}
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail }
}
globalThis.window = {
  innerWidth: 1200,
  innerHeight: 800,
  matchMedia() { return { matches: false } },
  dispatchEvent(event) { workspaceEvents.push(event); return true }
}

const classes = new Set(['weather-widget'])
const widget = {
  id: 'weatherTimeWidget',
  dataset: {},
  inert: false,
  style: { setProperty() {} },
  classList: {
    contains(name) { return classes.has(name) },
    add(name) { classes.add(name) },
    remove(name) { classes.delete(name) },
    toggle(name, force) {
      if (force) classes.add(name)
      else classes.delete(name)
      return Boolean(force)
    }
  },
  addEventListener() {},
  setAttribute(name, value) { this[name] = value },
  dispatchEvent(event) { widgetEvents.push(event); return true },
  getBoundingClientRect() { return { left: 20, top: 30 } }
}
globalThis.document = {
  body: { style: {} },
  documentElement: { clientWidth: 1200, clientHeight: 800 },
  querySelectorAll(selector) {
    return selector === '.weather-widget, [data-ww-workspace-widget]' ? [widget] : []
  },
  querySelector() { return null },
  getElementById(id) { return id === 'weatherTimeWidget' ? widget : null }
}

const { workspaceManager } = await import('../webwindows-vue/src/stores/workspaceManager.js')
const workspaceId = workspaceManager.getActiveWorkspace().id

assert.equal(workspaceManager.setDesktopWidgetVisibility('weatherTimeWidget', false), true)
assert.equal(classes.has('ww-workspace-widget-hidden'), true)
assert.equal(widget.inert, true)
assert.equal(widget['aria-hidden'], 'true')
assert.equal(widgetEvents.at(-1).detail.visible, false)
assert.equal(JSON.parse(storage.get(workspaceManager.storageKey)).workspaces[0].widgets[0].visible, false)

assert.equal(workspaceManager.setDesktopWidgetVisibility('weatherTimeWidget', true), true)
assert.equal(classes.has('ww-workspace-widget-hidden'), false)
assert.equal(widget.inert, false)
assert.equal(widget['aria-hidden'], 'false')
assert.equal(widgetEvents.at(-1).detail.visible, true)
assert.ok(workspaceEvents.some((event) => event.type === workspaceManager.events.changed && event.detail.visible === false))
assert.equal(workspaceManager.getActiveWorkspace().id, workspaceId)

console.log('workspace widget visibility smoke test passed')
