const STORAGE_KEY = 'webwindows.workspaces.v1'
const STORAGE_VERSION = 2
const DEFAULT_WORKSPACE_ID = 'workspace-daily'
let seedLegacyWidgetScenes = false

const EVENTS = Object.freeze({
  changed: 'webwindows:workspace-changed',
  created: 'webwindows:workspace-created',
  renamed: 'webwindows:workspace-renamed',
  removed: 'webwindows:workspace-removed',
  switched: 'webwindows:workspace-switched',
  moved: 'webwindows:workspace-window-moved',
  reordered: 'webwindows:workspace-reordered'
})

function now() {
  return new Date().toISOString()
}

function makeWorkspace(name, order, id) {
  const timestamp = now()
  return {
    id: id || `workspace-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`,
    name,
    order,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: timestamp,
    active: false,
    windows: [],
    wallpaper: null,
    widgets: [],
    shortcuts: [],
    desktopIconLayout: { desktop: {}, mobile: {} },
    sync: null,
    shared: false,
    mode: 'desktop'
  }
}

function readLegacyJson(key, fallback = {}) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
  } catch (_) {
    return fallback
  }
}

function normalizeIconLayout(value, legacy = false) {
  const desktop = value?.desktop && typeof value.desktop === 'object' ? value.desktop :
    (legacy && value && typeof value === 'object' ? value : {})
  const mobile = value?.mobile && typeof value.mobile === 'object' ? value.mobile : {}
  return { desktop: { ...desktop }, mobile: { ...mobile } }
}

function legacySceneDefaults() {
  return {
    wallpaper: localStorage.getItem('selectedWallpaper') || null,
    desktopIconLayout: {
      desktop: readLegacyJson('webwindows.desktop.iconPositions'),
      mobile: readLegacyJson('webwindows.mobile.iconPositions')
    }
  }
}

function defaultState() {
  const daily = makeWorkspace('日常', 0, DEFAULT_WORKSPACE_ID)
  const legacy = legacySceneDefaults()
  daily.wallpaper = legacy.wallpaper
  daily.desktopIconLayout = legacy.desktopIconLayout
  daily.active = true
  return {
    version: STORAGE_VERSION,
    workspaces: [daily],
    defaultWorkspaceId: daily.id,
    activeWorkspaceId: daily.id,
    activeWindowId: null,
    taskbarMode: 'active',
    windows: {}
  }
}

function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (![1, STORAGE_VERSION].includes(value?.version) || !Array.isArray(value.workspaces)) return defaultState()

    const migratingLegacyState = value.version === 1
    seedLegacyWidgetScenes = migratingLegacyState
    const legacy = migratingLegacyState ? legacySceneDefaults() : null
    const workspaces = value.workspaces
      .filter((workspace) => workspace && typeof workspace.id === 'string')
      .map((workspace, index) => {
        const normalized = {
          ...makeWorkspace(String(workspace.name || `桌面 ${index + 1}`), index, workspace.id),
          ...workspace,
          name: String(workspace.name || `桌面 ${index + 1}`).trim() || `桌面 ${index + 1}`,
          order: Number.isFinite(Number(workspace.order)) ? Number(workspace.order) : index,
          lastUsedAt: workspace.lastUsedAt || workspace.updatedAt || workspace.createdAt || now(),
          wallpaper: typeof workspace.wallpaper === 'string' && workspace.wallpaper
            ? workspace.wallpaper
            : (migratingLegacyState ? legacy.wallpaper : null),
          desktopIconLayout: normalizeIconLayout(
            workspace.desktopIconLayout || workspace.iconLayout ||
              (migratingLegacyState ? legacy.desktopIconLayout : null),
            !workspace.desktopIconLayout && !workspace.iconLayout && migratingLegacyState
          ),
          widgets: Array.isArray(workspace.widgets) ? workspace.widgets : [],
          shortcuts: Array.isArray(workspace.shortcuts)
            ? [...new Set(workspace.shortcuts.filter((id) => typeof id === 'string'))]
            : [],
          windows: Array.isArray(workspace.windows)
            ? [...new Set(workspace.windows.filter((id) => typeof id === 'string'))]
            : []
        }
        delete normalized.iconLayout
        return normalized
      })
      .sort((left, right) => left.order - right.order)

    if (!workspaces.length) return defaultState()
    workspaces.forEach((workspace, index) => {
      workspace.order = index
      workspace.active = workspace.id === value.activeWorkspaceId
    })
    const activeWorkspaceId = workspaces.some((workspace) => workspace.id === value.activeWorkspaceId)
      ? value.activeWorkspaceId
      : workspaces[0].id
    const defaultWorkspaceId = workspaces.some((workspace) => workspace.id === value.defaultWorkspaceId)
      ? value.defaultWorkspaceId
      : workspaces[0].id
    workspaces.forEach((workspace) => { workspace.active = workspace.id === activeWorkspaceId })

    return {
      version: STORAGE_VERSION,
      workspaces,
      defaultWorkspaceId,
      activeWorkspaceId,
      activeWindowId: typeof value.activeWindowId === 'string' ? value.activeWindowId : null,
      // Taskbar window buttons always belong to the active workspace. Older
      // saved "all workspaces" preferences are normalized during migration.
      taskbarMode: 'active',
      windows: value.windows && typeof value.windows === 'object' && !Array.isArray(value.windows)
        ? value.windows
        : {}
    }
  } catch (_) {
    seedLegacyWidgetScenes = false
    return defaultState()
  }
}

const state = readState()
const windowElements = new Map()
const observedDesktopWidgets = new WeakSet()
let restoring = false
let taskbarActivationBound = false

function findWorkspace(id) {
  return state.workspaces.find((workspace) => workspace.id === id) || null
}

function emit(name, detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
  window.dispatchEvent(new CustomEvent(name, { detail: { ...detail, activeWorkspaceId: state.activeWorkspaceId } }))
  if (name !== EVENTS.changed) {
    window.dispatchEvent(new CustomEvent(EVENTS.changed, {
      detail: { ...detail, event: name, activeWorkspaceId: state.activeWorkspaceId }
    }))
  }
}

function persist() {
  state.workspaces.forEach((workspace, index) => {
    workspace.order = index
    workspace.active = workspace.id === state.activeWorkspaceId
  })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('[WorkspaceManager] 工作空间状态保存失败。', error)
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function activeLayoutMode() {
  return typeof window !== 'undefined' && window.matchMedia?.('(max-width: 820px), (max-width: 1000px) and (max-height: 500px)').matches
    ? 'mobile'
    : 'desktop'
}

function bindDesktopWidget(element) {
  if (!element || observedDesktopWidgets.has(element)) return
  observedDesktopWidgets.add(element)
  element.addEventListener('pointerdown', () => {
    element.classList.remove('ww-workspace-widget-positioned')
  }, true)
  element.addEventListener('pointerup', () => {
    captureDesktopWidgets(state.activeWorkspaceId)
    persist()
  })
}

function captureDesktopIconLayout(workspaceId = state.activeWorkspaceId) {
  if (typeof document === 'undefined') return {}
  const workspace = findWorkspace(workspaceId)
  const desktop = document.querySelector('.desktop')
  if (!workspace || !desktop) return {}
  const mode = activeLayoutMode()
  const positions = {}
  desktop.querySelectorAll('.icon[id]').forEach((icon) => {
    if (icon.classList.contains('ww-workspace-shortcut-hidden') || icon.style.display === 'none') return
    const x = Number.parseFloat(icon.style.left)
    const y = Number.parseFloat(icon.style.top)
    if (Number.isFinite(x) && Number.isFinite(y)) positions[icon.id] = { x, y }
  })
  workspace.desktopIconLayout ||= { desktop: {}, mobile: {} }
  workspace.desktopIconLayout[mode] = positions
  return positions
}

function captureDesktopWidgets(workspaceId = state.activeWorkspaceId) {
  if (typeof document === 'undefined') return []
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return []
  const current = new Map((workspace.widgets || []).map((widget) => [widget.id, widget]))
  document.querySelectorAll('.weather-widget, [data-ww-workspace-widget]').forEach((element) => {
    const id = element.dataset.wwWorkspaceWidget || element.id
    if (!id) return
    const rect = element.getBoundingClientRect?.()
    const width = Math.max(1, window.innerWidth || document.documentElement?.clientWidth || 1)
    const height = Math.max(1, window.innerHeight || document.documentElement?.clientHeight || 1)
    const visible = !element.classList.contains('ww-workspace-widget-hidden') &&
      getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).display !== 'none'
    const existing = current.get(id) || { id }
    current.set(id, {
      ...existing,
      id,
      visible,
      geometry: rect ? { x: rect.left / width, y: rect.top / height } : existing.geometry || null
    })
    bindDesktopWidget(element)
  })
  workspace.widgets = [...current.values()]
  return workspace.widgets
}

function applyDesktopWidgets(workspaceId = state.activeWorkspaceId) {
  if (typeof document === 'undefined') return
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return
  const saved = new Map((workspace.widgets || []).map((widget) => [widget.id, widget]))
  document.querySelectorAll('.weather-widget, [data-ww-workspace-widget]').forEach((element) => {
    const id = element.dataset.wwWorkspaceWidget || element.id
    const widget = saved.get(id)
    const visible = Boolean(widget && widget.visible !== false)
    element.classList.toggle('ww-workspace-widget-hidden', !visible)
    element.inert = !visible
    element.setAttribute('aria-hidden', visible ? 'false' : 'true')
    element.dispatchEvent(new CustomEvent('webwindows:desktop-widget-visibility', {
      detail: { id, visible, workspaceId, geometry: widget?.geometry || null }
    }))
    if (widget?.geometry && element.style.setProperty) {
      element.style.setProperty('--ww-workspace-widget-x', `${Math.max(0, Math.min(1, widget.geometry.x)) * 100}%`)
      element.style.setProperty('--ww-workspace-widget-y', `${Math.max(0, Math.min(1, widget.geometry.y)) * 100}%`)
      element.classList.add('ww-workspace-widget-positioned')
    } else {
      element.classList.remove('ww-workspace-widget-positioned')
    }
  })
}

function setDesktopWidgetVisibility(id, visible, workspaceId = state.activeWorkspaceId) {
  if (!id) return false
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return false
  const current = new Map((workspace.widgets || []).map((widget) => [widget.id, widget]))
  const widget = current.get(id) || { id }
  widget.visible = Boolean(visible)
  current.set(id, widget)
  workspace.widgets = [...current.values()]
  workspace.updatedAt = now()
  applyDesktopWidgets(workspaceId)
  persist()
  emit(EVENTS.changed, { workspaceId, widgetId: id, visible: widget.visible })
  return true
}

function applyDesktopShortcuts(workspaceId = state.activeWorkspaceId) {
  if (typeof document === 'undefined') return
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return
  const shortcuts = new Set(workspace.shortcuts || [])
  document.querySelectorAll('.desktop .icon[id]').forEach((icon) => {
    icon.classList.toggle('ww-workspace-shortcut-hidden', !shortcuts.has(icon.id))
  })
}

function registerDesktopWidget(element) {
  if (!element) return
  const id = element.dataset.wwWorkspaceWidget || element.id
  if (!id) return
  const workspace = findWorkspace(state.activeWorkspaceId)
  if (workspace && !workspace.widgets.some((widget) => widget.id === id)) {
    captureDesktopWidgets(state.activeWorkspaceId)
    if (seedLegacyWidgetScenes) {
      const initial = workspace.widgets.find((widget) => widget.id === id)
      if (initial) state.workspaces.forEach((candidate) => {
        if (!candidate.widgets.some((widget) => widget.id === id)) candidate.widgets.push(clone(initial))
      })
      seedLegacyWidgetScenes = false
    }
    persist()
  }
  bindDesktopWidget(element)
  applyDesktopWidgets()
}

function registerDesktopShortcut(id, workspaceId = state.activeWorkspaceId) {
  if (!id) return false
  const workspace = findWorkspace(workspaceId)
  if (!workspace || workspace.shortcuts.includes(id)) return false
  workspace.shortcuts.push(id)
  workspace.updatedAt = now()
  applyDesktopShortcuts(workspaceId)
  persist()
  emit(EVENTS.changed, { workspaceId, shortcutId: id })
  return true
}

function setDesktopIconLayout(layout, mode = activeLayoutMode(), workspaceId = state.activeWorkspaceId) {
  const workspace = findWorkspace(workspaceId)
  if (!workspace || !['desktop', 'mobile'].includes(mode)) return false
  workspace.desktopIconLayout ||= { desktop: {}, mobile: {} }
  workspace.desktopIconLayout[mode] = clone(layout || {})
  workspace.updatedAt = now()
  persist()
  emit(EVENTS.changed, { workspaceId, desktopIconLayout: workspace.desktopIconLayout })
  return true
}

function getDesktopIconLayout(mode = activeLayoutMode(), workspaceId = state.activeWorkspaceId) {
  const workspace = findWorkspace(workspaceId)
  return workspace?.desktopIconLayout?.[mode] ? clone(workspace.desktopIconLayout[mode]) : {}
}

function setWorkspaceWallpaper(path, workspaceId = state.activeWorkspaceId) {
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return false
  const normalizedPath = typeof path === 'string' && path.trim() ? path.trim() : null
  if (workspace.wallpaper === normalizedPath) return true
  workspace.wallpaper = normalizedPath
  workspace.updatedAt = now()
  try {
    if (workspaceId === state.activeWorkspaceId && workspace.wallpaper) localStorage.setItem('selectedWallpaper', workspace.wallpaper)
    else if (workspaceId === state.activeWorkspaceId) localStorage.removeItem('selectedWallpaper')
  } catch (_) {}
  persist()
  emit(EVENTS.changed, { workspaceId, wallpaper: workspace.wallpaper })
  return true
}

function initializeDesktopScene() {
  if (typeof document === 'undefined') return
  bindTaskbarActivation()
  const icons = [...document.querySelectorAll('.desktop .icon[id]')]
  if (icons.length) state.workspaces.forEach((workspace) => {
    if (!workspace.shortcuts.length) workspace.shortcuts = icons.map((icon) => icon.id)
  })
  applyDesktopShortcuts()
  document.querySelectorAll('.weather-widget, [data-ww-workspace-widget]').forEach(registerDesktopWidget)
  if (typeof MutationObserver === 'function' && !desktopWidgetObserver) {
    desktopWidgetObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return
        if (node.matches?.('.weather-widget, [data-ww-workspace-widget]')) registerDesktopWidget(node)
        node.querySelectorAll?.('.weather-widget, [data-ww-workspace-widget]').forEach(registerDesktopWidget)
      }))
    })
    desktopWidgetObserver.observe(document.body, { childList: true, subtree: true })
  }
  applyDesktopWidgets()
  persist()
}

function captureWorkspaceScene(workspaceId = state.activeWorkspaceId) {
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return
  try {
    const selectedWallpaper = localStorage.getItem('selectedWallpaper')
    if (selectedWallpaper) workspace.wallpaper = selectedWallpaper
  } catch (_) {}
  captureDesktopIconLayout(workspaceId)
  captureDesktopWidgets(workspaceId)
}

function applyWorkspaceScene(workspaceId = state.activeWorkspaceId) {
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return
  const path = workspace.wallpaper
  try {
    if (path) localStorage.setItem('selectedWallpaper', path)
    else localStorage.removeItem('selectedWallpaper')
  } catch (_) {}
  if (path && typeof window?.setWallpaperByPath === 'function') {
    window.setWallpaperByPath(path)
  } else if (typeof document !== 'undefined' && document.body?.style) {
    document.body.style.backgroundImage = path ? `url("${String(path).replace(/["\\\\]/g, '')}")` : ''
  }
  applyDesktopShortcuts(workspaceId)
  applyDesktopWidgets(workspaceId)
}

let desktopWidgetObserver = null

function readCssLength(value, fallback) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? `${parsed}px` : fallback
}

function captureWindow(element) {
  const id = element.id?.replace(/^win-/, '')
  if (!id) return null
  const previous = state.windows[id] || {}
  const maximized = element.classList.contains('maximized')
  const iframe = element.querySelector('iframe')
  const title = element.querySelector('.window-header .title')?.textContent?.trim() ||
    element.querySelector('.window-header .window-title')?.textContent?.trim() ||
    previous.title || id
  const geometry = maximized
    ? {
        left: readCssLength(element.dataset.prevLeft, previous.geometry?.left || '120px'),
        top: readCssLength(element.dataset.prevTop, previous.geometry?.top || '100px'),
        width: readCssLength(element.dataset.prevWidth, previous.geometry?.width || '900px'),
        height: readCssLength(element.dataset.prevHeight, previous.geometry?.height || '640px')
      }
    : {
        left: readCssLength(element.style.left, previous.geometry?.left || '120px'),
        top: readCssLength(element.style.top, previous.geometry?.top || '100px'),
        width: readCssLength(element.style.width, previous.geometry?.width || '900px'),
        height: readCssLength(element.style.height, previous.geometry?.height || '640px')
      }
  return {
    ...previous,
    id,
    appId: element.dataset.wwAppId || previous.appId || id,
    title,
    url: element.dataset.wwWindowUrl || iframe?.getAttribute('src') || previous.url || '',
    iconUrl: element.dataset.wwIconUrl || element.querySelector('.window-icon')?.getAttribute('src') || previous.iconUrl || '',
    useIframe: element.dataset.wwUseIframe !== 'false' && Boolean(iframe || previous.useIframe),
    type: element.dataset.wwWindowType || previous.type || '',
    workspaceId: element.workspaceId || element.dataset.workspaceId || previous.workspaceId || state.activeWorkspaceId,
    geometry,
    maximized,
    minimized: element.dataset.wwMinimized === '1' || element.style.display === 'none',
    zIndex: Number.parseInt(element.style.zIndex || '', 10) || previous.zIndex || 1000,
    updatedAt: now()
  }
}

function applySavedWindowState(element, saved) {
  if (!element || !saved) return
  const geometry = saved.geometry || {}
  if (saved.maximized) {
    element.dataset.prevLeft = geometry.left || '120px'
    element.dataset.prevTop = geometry.top || '100px'
    element.dataset.prevWidth = geometry.width || '900px'
    element.dataset.prevHeight = geometry.height || '640px'
    element.classList.add('maximized')
    element.style.left = '0px'
    element.style.top = '0px'
    element.style.width = '100vw'
    const taskbarHeight = document.querySelector('.taskbar')?.offsetHeight || 43
    element.style.height = `calc(100dvh - ${taskbarHeight}px)`
  } else {
    element.classList.remove('maximized')
    element.style.left = geometry.left || element.style.left || '120px'
    element.style.top = geometry.top || element.style.top || '100px'
    element.style.width = geometry.width || element.style.width || '900px'
    element.style.height = geometry.height || element.style.height || '640px'
  }
  element.style.zIndex = String(saved.zIndex || 1000)
  element.dataset.wwMinimized = saved.minimized ? '1' : '0'
  element.style.display = saved.minimized ? 'none' : ''
}

function applyWindowVisibility() {
  for (const [id, element] of windowElements) {
    if (!element.isConnected) {
      windowElements.delete(id)
      continue
    }
    const visible = (element.workspaceId || element.dataset.workspaceId) === state.activeWorkspaceId
    element.classList.toggle('ww-workspace-inactive', !visible)
    element.inert = !visible
    element.setAttribute('aria-hidden', visible ? 'false' : 'true')
  }
  applyTaskbarVisibility()
}

function applyTaskbarVisibility() {
  document.querySelectorAll('.taskbar-app[data-id]').forEach((icon) => {
    const id = icon.dataset.id.replace(/^win-/, '')
    const workspaceId = state.windows[id]?.workspaceId || icon.dataset.workspaceId || state.activeWorkspaceId
    icon.dataset.workspaceId = workspaceId
    icon.style.display = workspaceId === state.activeWorkspaceId
      ? 'flex'
      : 'none'
  })
}

function updateTaskbarWindowState(id, active) {
  const icon = document.querySelector(`.taskbar-app[data-id="win-${id}"]`)
  if (!icon) return
  icon.classList.toggle('active', Boolean(active))
  window.updateTaskbarActive?.(id, Boolean(active))
}

function handleTaskbarActivation(event) {
  const previewViewport = event.target?.closest?.('.taskbar-window-preview__viewport')
  if (previewViewport) {
    const preview = document.getElementById('taskbar-window-preview')
    const previewId = String(preview?.dataset.windowId || '').replace(/^win-/, '')
    const previewWindow = previewId && (windowElements.get(previewId) || document.getElementById(`win-${previewId}`))
    if (!previewId || !previewWindow) return
    event.preventDefault()
    event.stopImmediatePropagation()
    restoreTaskbarWindow(previewId, previewWindow)
    return
  }

  const icon = event.target?.closest?.('.taskbar-app[data-id]')
  if (!icon) return
  const id = String(icon.dataset.id || '').replace(/^win-/, '')
  if (!id) return
  const record = getWindowState(id)
  const element = windowElements.get(id) || document.getElementById(`win-${id}`)
  if (!record || !element) return
  const otherWorkspace = record.workspaceId !== state.activeWorkspaceId
  const minimized = element.style.display === 'none' || element.dataset.wwMinimized === '1'
  event.preventDefault()
  event.stopImmediatePropagation()
  if (!otherWorkspace && !minimized &&
      (element.classList.contains('active') || state.activeWindowId === id)) {
    minimizeTaskbarWindow(id, element)
    return
  }
  restoreTaskbarWindow(id, element)
}

function minimizeTaskbarWindow(id, element) {
  element.dataset.wwMinimized = '1'
  element.classList.remove('ww-anim-unmin')
  const animate = document.documentElement?.dataset.wwEffects !== 'off'
  if (animate) {
    element.classList.add('ww-anim-min')
    window.setTimeout(() => {
      if (element.dataset.wwMinimized === '1') element.style.display = 'none'
      element.classList.remove('ww-anim-min')
    }, 170)
  } else {
    element.classList.remove('ww-anim-min')
    element.style.display = 'none'
  }
  selectTopWindow(state.activeWorkspaceId)
  persistWindow(element)
  updateTaskbarWindowState(id, false)
}

function restoreTaskbarWindow(id, element) {
  activateWindow(id)
  element.style.display = ''
  element.dataset.wwMinimized = '0'
  element.classList.remove('ww-workspace-inactive')
  element.classList.remove('ww-anim-min')
  element.classList.remove('ww-anim-unmin')
  element.inert = false
  element.setAttribute('aria-hidden', 'false')
  void element.offsetWidth
  element.classList.add('ww-anim-unmin')
  window.setTimeout(() => element.classList.remove('ww-anim-unmin'), 230)
  if (typeof window.focusTargetWindow === 'function') {
    window.focusTargetWindow(element)
  } else {
    let topZIndex = 0
    document.querySelectorAll('.window').forEach((candidate) => {
      topZIndex = Math.max(topZIndex, Number.parseInt(candidate.style.zIndex || '', 10) || 0)
      candidate.classList.remove('active')
    })
    element.style.zIndex = String(topZIndex + 1)
    element.classList.add('active')
    setActiveWindow(id)
  }
  element.style.display = ''
  element.dataset.wwMinimized = '0'
  persistWindow(element)
  updateTaskbarWindowState(id, true)
}

function bindTaskbarActivation() {
  if (taskbarActivationBound || typeof document === 'undefined' || typeof document.addEventListener !== 'function') return
  document.addEventListener('click', handleTaskbarActivation, true)
  taskbarActivationBound = true
}

function selectTopWindow(workspaceId) {
  const candidates = [...windowElements.entries()]
    .filter(([, element]) => element.isConnected &&
      (element.workspaceId || element.dataset.workspaceId) === workspaceId &&
      element.style.display !== 'none' && element.dataset.wwMinimized !== '1')
    .sort((left, right) =>
      (Number.parseInt(right[1].style.zIndex || '', 10) || 0) -
      (Number.parseInt(left[1].style.zIndex || '', 10) || 0))
  document.querySelectorAll('.window.active').forEach((element) => element.classList.remove('active'))
  state.activeWindowId = candidates[0]?.[0] || null
  if (candidates[0]) candidates[0][1].classList.add('active')
}

function refreshWorkspaceWindowLists() {
  state.workspaces.forEach((workspace) => { workspace.windows = [] })
  Object.values(state.windows).forEach((record) => {
    const workspace = findWorkspace(record.workspaceId) || findWorkspace(state.defaultWorkspaceId)
    if (!workspace) return
    record.workspaceId = workspace.id
    if (!workspace.windows.includes(record.id)) workspace.windows.push(record.id)
  })
}

function normalizeWindowContextMenu(menu, windowId) {
  const translate = (text) => window.WebWindowsI18n?.translate?.(text) || text
  const workspaceName = (name) => {
    const numbered = /^桌面 (\d+)$/.exec(name)
    if (name === '日常') return translate(name)
    return numbered ? `${translate('桌面')} ${numbered[1]}` : name
  }
  let parent = menu.querySelector('[data-ww-workspace-menu]')
  if (!parent) {
    parent = document.createElement('li')
    parent.dataset.wwWorkspaceMenu = 'true'
    parent.className = 'ww-workspace-menu-parent'
    parent.innerHTML = `<span>${translate('移动到工作空间')}</span><span aria-hidden="true">›</span><div class="ww-workspace-submenu" role="menu"></div>`
    menu.querySelector('ul')?.appendChild(parent)
  }
  parent.firstElementChild.textContent = translate('移动到工作空间')
  const submenu = parent.querySelector('.ww-workspace-submenu')
  submenu.replaceChildren()
  state.workspaces.forEach((workspace) => {
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'ww-workspace-submenu-item'
    item.setAttribute('role', 'menuitem')
    item.textContent = `${workspace.id === (state.windows[windowId]?.workspaceId || state.activeWorkspaceId) ? '✓ ' : ''}${workspaceName(workspace.name)}`
    item.addEventListener('click', (event) => {
      event.stopPropagation()
      moveWindowToWorkspace(windowId, workspace.id)
      window.hideWindowContextMenu?.()
    })
    submenu.appendChild(item)
  })
  const separator = document.createElement('div')
  separator.className = 'ww-workspace-submenu-separator'
  submenu.appendChild(separator)
  const create = document.createElement('button')
  create.type = 'button'
  create.className = 'ww-workspace-submenu-item'
  create.textContent = translate('新建工作空间…')
  create.addEventListener('click', (event) => {
    event.stopPropagation()
    const workspace = createWorkspace()
    moveWindowToWorkspace(windowId, workspace.id)
    window.hideWindowContextMenu?.()
  })
  submenu.appendChild(create)
}

function createWorkspace(name) {
  const nextNumber = (() => {
    const used = new Set(state.workspaces.map((workspace) => workspace.name))
    let number = 2
    while (used.has(`桌面 ${number}`)) number += 1
    return number
  })()
  const workspace = makeWorkspace(name || `桌面 ${nextNumber}`, state.workspaces.length)
  const active = findWorkspace(state.activeWorkspaceId)
  if (active) {
    workspace.wallpaper = active.wallpaper
    workspace.desktopIconLayout = clone(active.desktopIconLayout || { desktop: {}, mobile: {} })
    workspace.widgets = clone(active.widgets || [])
    workspace.shortcuts = [...(active.shortcuts || [])]
  }
  state.workspaces.push(workspace)
  persist()
  emit(EVENTS.created, { workspace: { ...workspace }, workspaces: getWorkspaces() })
  return workspace
}

function getWorkspaces() {
  return state.workspaces.map((workspace) => clone(workspace))
}

function getActiveWorkspace() {
  const workspace = findWorkspace(state.activeWorkspaceId)
  return workspace ? clone(workspace) : null
}

function getWindowState(id) {
  const element = windowElements.get(id) || document.getElementById(`win-${id}`)
  if (element) {
    const record = captureWindow(element)
    if (record) state.windows[id] = record
  }
  const record = state.windows[id]
  return record ? { ...record, geometry: { ...(record.geometry || {}) } } : null
}

function getWorkspaceWindows(workspaceId) {
  const workspace = findWorkspace(workspaceId)
  if (!workspace) return []
  refreshWorkspaceWindowLists()
  return workspace.windows.map((id) => getWindowState(id)).filter(Boolean)
}

function getSnapshot() {
  windowElements.forEach((element, id) => {
    if (element.isConnected) {
      const record = captureWindow(element)
      if (record) state.windows[id] = record
    }
  })
  refreshWorkspaceWindowLists()
  return JSON.parse(JSON.stringify(state))
}

function registerWindow(element, metadata = {}) {
  if (!element?.id) return null
  const id = element.id.replace(/^win-/, '')
  const saved = state.windows[id]
  const workspaceId = findWorkspace(saved?.workspaceId)?.id || state.activeWorkspaceId
  element.workspaceId = workspaceId
  element.dataset.workspaceId = workspaceId
  element.dataset.wwAppId = metadata.appId || element.dataset.wwAppId || id
  element.dataset.wwWindowUrl = metadata.url ?? element.dataset.wwWindowUrl ?? ''
  element.dataset.wwIconUrl = metadata.iconUrl ?? element.dataset.wwIconUrl ?? ''
  element.dataset.wwUseIframe = metadata.useIframe === false ? 'false' : 'true'
  element.dataset.wwWindowType = metadata.type || element.dataset.wwWindowType || ''
  windowElements.set(id, element)
  if (saved && metadata.applySaved !== false) applySavedWindowState(element, saved)
  const record = captureWindow(element)
  if (record) state.windows[id] = record
  const owningWorkspace = findWorkspace(workspaceId)
  if (owningWorkspace && !restoring && workspaceId === state.activeWorkspaceId) owningWorkspace.lastUsedAt = now()
  refreshWorkspaceWindowLists()
  applyWindowVisibility()
  persist()
  return workspaceId
}

function persistWindow(elementOrId) {
  const element = typeof elementOrId === 'string'
    ? windowElements.get(elementOrId) || document.getElementById(`win-${elementOrId}`)
    : elementOrId
  if (!element?.id) return
  const record = captureWindow(element)
  if (record) state.windows[record.id] = record
  if (record?.minimized && state.activeWindowId === record.id) {
    state.activeWindowId = null
    selectTopWindow(state.activeWorkspaceId)
  }
  refreshWorkspaceWindowLists()
  persist()
}

function removeWindow(id) {
  windowElements.delete(id)
  const previous = state.windows[id]
  delete state.windows[id]
  if (state.activeWindowId === id) state.activeWindowId = null
  refreshWorkspaceWindowLists()
  persist()
  emit(EVENTS.changed, { windowId: id, removed: Boolean(previous) })
}

function switchWorkspace(id) {
  if (!findWorkspace(id) || id === state.activeWorkspaceId) return false
  const previousWorkspaceId = state.activeWorkspaceId
  captureWorkspaceScene(previousWorkspaceId)
  state.activeWorkspaceId = id
  const next = findWorkspace(id)
  if (next) {
    next.updatedAt = now()
    next.lastUsedAt = now()
  }
  applyWorkspaceScene(id)
  applyWindowVisibility()
  selectTopWindow(id)
  persist()
  emit(EVENTS.switched, { previousWorkspaceId, workspaceId: id, workspace: getActiveWorkspace() })
  return true
}

function renameWorkspace(id, name) {
  const workspace = findWorkspace(id)
  const normalizedName = String(name || '').trim()
  if (!workspace || !normalizedName) return false
  workspace.name = normalizedName.slice(0, 48)
  workspace.updatedAt = now()
  persist()
  emit(EVENTS.renamed, { workspace: { ...workspace } })
  return true
}

function removeWorkspace(id, options = {}) {
  const index = state.workspaces.findIndex((workspace) => workspace.id === id)
  if (index < 0 || state.workspaces.length <= 1) return false
  const workspace = state.workspaces[index]
  if (workspace.windows.length && options.confirmed !== true) {
    const error = new Error('该工作空间仍有窗口，需要确认后再删除。')
    error.code = 'WORKSPACE_NOT_EMPTY'
    throw error
  }
  if (state.activeWorkspaceId === id) captureWorkspaceScene(id)

  const adjacent = state.workspaces[index + 1] || state.workspaces[index - 1]
  if (id === state.defaultWorkspaceId) state.defaultWorkspaceId = adjacent.id
  const destination = findWorkspace(state.defaultWorkspaceId) || adjacent
  const movedWindowIds = [...workspace.windows]
  movedWindowIds.forEach((windowId) => {
    const record = state.windows[windowId]
    if (record) record.workspaceId = destination.id
    const element = windowElements.get(windowId)
    if (element) {
      element.workspaceId = destination.id
      element.dataset.workspaceId = destination.id
    }
  })

  if (state.activeWorkspaceId === id) {
    state.activeWorkspaceId = adjacent.id
    adjacent.lastUsedAt = now()
    applyWorkspaceScene(adjacent.id)
  }
  state.workspaces.splice(index, 1)
  refreshWorkspaceWindowLists()
  applyWindowVisibility()
  selectTopWindow(state.activeWorkspaceId)
  persist()
  emit(EVENTS.removed, { workspaceId: id, movedWindowIds, destinationWorkspaceId: destination.id })
  return true
}

function moveWindowToWorkspace(windowId, targetWorkspaceId) {
  const target = findWorkspace(targetWorkspaceId)
  const record = getWindowState(windowId)
  if (!target || !record || record.workspaceId === targetWorkspaceId) return false
  const sourceWorkspaceId = record.workspaceId
  const source = findWorkspace(sourceWorkspaceId)
  if (source) source.updatedAt = now()
  target.updatedAt = now()
  record.workspaceId = targetWorkspaceId
  state.windows[windowId] = record
  const element = windowElements.get(windowId)
  if (element) {
    element.workspaceId = targetWorkspaceId
    element.dataset.workspaceId = targetWorkspaceId
  }
  refreshWorkspaceWindowLists()
  if (state.activeWindowId === windowId && targetWorkspaceId !== state.activeWorkspaceId) {
    state.activeWindowId = null
    selectTopWindow(state.activeWorkspaceId)
  }
  applyWindowVisibility()
  persist()
  emit(EVENTS.moved, { windowId, sourceWorkspaceId, targetWorkspaceId })
  return true
}

function reorderWorkspace(workspaceId, targetIndex) {
  const sourceIndex = state.workspaces.findIndex((workspace) => workspace.id === workspaceId)
  if (sourceIndex < 0) return false
  const destination = Math.max(0, Math.min(state.workspaces.length - 1, Number(targetIndex) || 0))
  if (sourceIndex === destination) return false
  const [workspace] = state.workspaces.splice(sourceIndex, 1)
  state.workspaces.splice(destination, 0, workspace)
  persist()
  emit(EVENTS.reordered, { workspaceId, workspaces: getWorkspaces() })
  return true
}

function setTaskbarMode(mode) {
  state.taskbarMode = 'active'
  applyTaskbarVisibility()
  persist()
  emit(EVENTS.changed, { taskbarMode: state.taskbarMode, requestedMode: mode })
}

function registerTaskbarIcon(icon, id) {
  if (!icon) return
  const workspaceId = state.windows[id]?.workspaceId || state.activeWorkspaceId
  icon.dataset.workspaceId = workspaceId
  applyTaskbarVisibility()
}

function activateWindow(id) {
  let record = getWindowState(id)
  if (!record) return false
  if (record.workspaceId !== state.activeWorkspaceId) {
    moveWindowToWorkspace(id, state.activeWorkspaceId)
    record = getWindowState(id)
    if (!record) return false
  }
  const element = windowElements.get(id) || document.getElementById(`win-${id}`)
  if (element) {
    element.style.display = ''
    element.dataset.wwMinimized = '0'
    persistWindow(element)
  }
  return true
}

function setActiveWindow(id) {
  const record = getWindowState(id)
  if (record && record.workspaceId !== state.activeWorkspaceId && !restoring) return false
  state.activeWindowId = id
  const workspace = findWorkspace(record?.workspaceId)
  if (workspace) workspace.lastUsedAt = now()
  persistWindow(id)
}

function setRestoring(value) {
  restoring = Boolean(value)
}

function initializeExistingWindows() {
  document.querySelectorAll('.window[id^="win-"]').forEach((element) => {
    registerWindow(element, { applySaved: true })
  })
}

function applyAllSavedWindowStates() {
  windowElements.forEach((element, id) => {
    const saved = state.windows[id]
    if (element.isConnected && saved) applySavedWindowState(element, saved)
  })
  applyWindowVisibility()
  const activeWorkspace = findWorkspace(state.activeWorkspaceId)
  if (activeWorkspace && state.activeWindowId &&
      state.windows[state.activeWindowId]?.workspaceId === state.activeWorkspaceId &&
      !state.windows[state.activeWindowId]?.minimized) {
    document.querySelectorAll('.window.active').forEach((element) => element.classList.remove('active'))
    windowElements.get(state.activeWindowId)?.classList.add('active')
  } else {
    selectTopWindow(state.activeWorkspaceId)
  }
}

async function restoreOpenWindows() {
  if (typeof window === 'undefined' || typeof window.openWindow !== 'function') return
  const savedWindows = Object.values(state.windows).sort((left, right) => left.zIndex - right.zIndex)
  const savedActiveWindowId = state.activeWindowId
  if (!savedWindows.length) {
    initializeExistingWindows()
    applyAllSavedWindowStates()
    return
  }
  restoring = true
  try {
    initializeExistingWindows()
    for (const saved of savedWindows) {
      if (document.getElementById(`win-${saved.id}`)) continue
      try {
        window.openWindow(
          saved.id,
          saved.title,
          saved.url,
          saved.iconUrl,
          saved.useIframe,
          saved.type,
          saved.geometry?.width || '900px',
          saved.geometry?.height || '640px'
        )
      } catch (error) {
        console.warn('[WorkspaceManager] 上次打开的窗口恢复失败。', saved.id, error)
      }
    }
    state.activeWindowId = savedActiveWindowId
    applyAllSavedWindowStates()
  } finally {
    restoring = false
    persist()
  }
}

function populateWindowContextMenu(menu, windowId) {
  if (menu) normalizeWindowContextMenu(menu, windowId)
}

refreshWorkspaceWindowLists()
persist()

export const workspaceManager = Object.freeze({
  events: EVENTS,
  storageKey: STORAGE_KEY,
  createWorkspace,
  removeWorkspace,
  renameWorkspace,
  switchWorkspace,
  moveWindowToWorkspace,
  getActiveWorkspace,
  getWorkspaces,
  getWorkspaceWindows,
  getSnapshot,
  reorderWorkspace,
  setTaskbarMode,
  initializeDesktopScene,
  applyWorkspaceScene,
  setWorkspaceWallpaper,
  getDesktopIconLayout,
  setDesktopIconLayout,
  applyDesktopWidgets,
  setDesktopWidgetVisibility,
  registerDesktopShortcut,
  applyDesktopShortcuts,
  captureWorkspaceScene,
  registerWindow,
  registerTaskbarIcon,
  persistWindow,
  removeWindow,
  activateWindow,
  setActiveWindow,
  setRestoring,
  initializeExistingWindows,
  restoreOpenWindows,
  applyAllSavedWindowStates,
  populateWindowContextMenu
})

if (typeof window !== 'undefined') {
  window.WebWindows = window.WebWindows || {}
  window.WebWindows.workspaces = workspaceManager
}
