<template>
  <!-- 桌面右键：你说已经 OK，这里沿用上次的简版 DOM 菜单。也可以删掉此块，保留窗口右键绑定即可 -->
  <teleport to="body">
    <div
      id="custom-context-menu"
      class="context-menu"
      :class="{ show: desk.show }"
      :style="{ left: desk.x + 'px', top: desk.y + 'px', display: desk.show ? 'block' : 'none' }"
      @contextmenu.prevent
    >
      <div class="context-menu-item" @click="onDeskPick('刷新')">
        <span class="menu-icon">🔄</span><span style="padding-left:10px">刷新</span>
      </div>
      <div class="context-menu-item" @click="onDeskPick('自动排列图标')">
        <span class="menu-icon">▦</span><span style="padding-left:10px">自动排列图标</span>
      </div>
      <div class="context-menu-item" @click="onDeskPick('设置')">
        <span class="menu-icon">⚙️</span><span style="padding-left:10px">设置</span>
      </div>
      <div class="context-menu-item" @click="onDeskPick('个性化')">
        <span class="menu-icon">🖼️</span><span style="padding-left:10px">个性化</span>
      </div>
      <div v-if="hiddenCount > 0" class="context-menu-item" @click="onDeskPick('显示隐藏的图标')">
        <span class="menu-icon">👁️</span><span style="padding-left:10px">显示隐藏的图标</span>
      </div>
    </div>
  </teleport>
  <!-- 图标右键：桌面图标自己的菜单（打开 / 隐藏图标 / 移除关联） -->
  <teleport to="body">
    <div
      id="icon-context-menu"
      class="context-menu"
      :class="{ show: icon.show }"
      :style="{ left: icon.x + 'px', top: icon.y + 'px', display: icon.show ? 'block' : 'none' }"
      @contextmenu.prevent
    >
      <div class="context-menu-title">{{ icon.label }}</div>
      <div class="context-menu-item" @click="onIconPick('打开')">
        <span class="menu-icon">▶️</span><span style="padding-left:10px">打开</span>
      </div>
      <div class="context-menu-item" @click="onIconPick('隐藏图标')">
        <span class="menu-icon">🙈</span><span style="padding-left:10px">隐藏图标</span>
      </div>
      <div v-if="icon.canUninstall" class="context-menu-item" @click="onIconPick('移除关联')">
        <span class="menu-icon">🗑️</span><span style="padding-left:10px">移除关联</span>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'

const W = window // 复用你 main.js 里的全局函数

const STATIC_HIDDEN_KEY = 'webwindows.desktop.hiddenIcons'

/* ---------------- 桌面右键（已 OK） ---------------- */
const desk = reactive({ x: 0, y: 0, show: false })

function showDeskMenu(x, y) {
  desk.x = x; desk.y = y; desk.show = true
  requestAnimationFrame(() => {
    const menu = document.getElementById('custom-context-menu')
    if (!menu) return
    const rect = menu.getBoundingClientRect()
    desk.x = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4))
    desk.y = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4))
    menu.classList.add('show')
  })
}
function hideDeskMenu() {
  const el = document.getElementById('custom-context-menu')
  el?.classList.remove('show')
  setTimeout(() => { desk.show = false }, 150)
}
function onDeskPick(text) {
  hideDeskMenu()
  if (text === '刷新') W.refreshDesktop?.()
  if (text === '自动排列图标') W.autoArrangeDesktopIcons?.()
  if (text === '设置') W.openWindow?.('settings', '设置', 'settings.html', 'assets/icons/settings.png', true)
  if (text === '个性化') openPersonalization()
  if (text === '显示隐藏的图标') restoreHiddenIcons()
}

function readStaticHidden() {
  try {
    const stored = JSON.parse(localStorage.getItem(STATIC_HIDDEN_KEY) || '[]')
    return Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : []
  } catch (_) {
    return []
  }
}

function writeStaticHidden(ids) {
  try {
    localStorage.setItem(STATIC_HIDDEN_KEY, JSON.stringify(ids))
  } catch (_) {}
  refreshHiddenCount()
}

const hiddenCount = ref(0)

async function countRegistryHidden() {
  const api = registryApi()
  if (!api) return 0
  try {
    await api.ready?.()
    const installed = await api.listInstalled?.() || []
    let count = 0
    for (const app of installed) {
      try {
        const association = await api.getInstallation?.(app)
        if (association?.explicit && association?.desktopVisible === false) count += 1
      } catch (_) {}
    }
    return count
  } catch (_) {
    return 0
  }
}

function refreshHiddenCount() {
  try {
    hiddenCount.value = readStaticHidden().length
  } catch (_) {
    hiddenCount.value = 0
  }
  // 注册表里被隐藏的一并计入（决定恢复项是否出现）
  countRegistryHidden().then(n => {
    try {
      hiddenCount.value = readStaticHidden().length + n
    } catch (_) {}
  }).catch(() => {})
}

async function restoreHiddenIcons() {
  const ids = readStaticHidden()
  writeStaticHidden([])
  ids.forEach(id => {
    try {
      const el = document.getElementById(id)
      if (el && el.classList.contains('icon') && !el.dataset.functionId) {
        // 按新图标追加到末尾，避免与自动排列后的占用格重叠
        if (typeof W.reinsertDesktopIcon === 'function') W.reinsertDesktopIcon(el)
        else el.style.display = ''
      }
    } catch (_) {}
  })
  // 注册表中被隐藏的（即使系统功能）同样恢复
  const api = registryApi()
  if (api) {
    try {
      await api.ready?.()
      const installed = await api.listInstalled?.() || []
      for (const app of installed) {
        try {
          const association = await api.getInstallation?.(app)
          if (association?.explicit && association?.desktopVisible === false) {
            await api.setDesktopVisible?.(app.id, true)
          }
        } catch (_) {}
      }
    } catch (_) {}
  }
  refreshHiddenCount()
  try {
    window.dispatchEvent(new CustomEvent('webwindows:desktop-icons-changed'))
  } catch (_) {}
}

function openPersonalization() {
  W.openWindow?.('settings', '设置', 'settings.html?tab=personalization', 'assets/icons/settings.png', true)
  // 设置窗口已开着时，直接让里面的 iframe 切到个性化页签
  window.setTimeout(() => {
    try {
      const frame = document.querySelector('#win-settings iframe')
      frame?.contentWindow?.postMessage({ type: 'open-settings-tab', tab: 'personalizationTab' }, window.location.origin)
    } catch (_) {}
  }, 60)
}

function onGlobalContext(e) {
  // 跟原生逻辑一致：window/taskbar/start-menu 内不弹桌面菜单
  e.preventDefault()
  const t = e.target
  if (t?.closest?.('.window')) return
  if (t?.closest?.('.taskbar')) return
  if (t?.closest?.('#start-menu')) return
  if (t?.closest?.('#custom-context-menu, #icon-context-menu, #window-context-menu')) return
  hideWindowMenu() // 如果窗口菜单开着，先关掉
  hideIconMenu()
  // 图标优先：点在桌面图标上弹图标自己的菜单
  const iconEl = t?.closest?.('.desktop .icon')
  if (iconEl) {
    showIconMenu(e.pageX, e.pageY, iconEl)
    return
  }
  showDeskMenu(e.pageX, e.pageY)
}

/* ---------------- 图标右键（桌面图标自己的菜单） ---------------- */
const icon = reactive({ x: 0, y: 0, show: false, el: null, appId: '', label: '', canUninstall: false })

function iconLabel(el) {
  try {
    return el.querySelector('label')?.textContent?.trim() ||
      el.title?.trim() ||
      el.id || '图标'
  } catch (_) {
    return '图标'
  }
}

function registryApi() {
  try {
    return W.WebWindows?.apps || null
  } catch (_) {
    return null
  }
}

function showIconMenu(x, y, el) {
  hideDeskMenu()
  icon.x = x; icon.y = y
  icon.el = el
  icon.appId = el.dataset?.functionId || ''
  icon.label = iconLabel(el)
  icon.canUninstall = false
  icon.show = true
  requestAnimationFrame(() => {
    const menu = document.getElementById('icon-context-menu')
    if (!menu) return
    const rect = menu.getBoundingClientRect()
    icon.x = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4))
    icon.y = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4))
    menu.classList.add('show')
  })
  // 异步补上“移除关联”可见性：只有注册表里的非系统应用才有
  resolveIconUninstall(el).then(ok => {
    if (icon.el === el) icon.canUninstall = ok
  }).catch(() => {})
}

async function resolveIconUninstall(el) {
  const appId = el.dataset?.functionId || ''
  if (!appId) return false
  const api = registryApi()
  if (!api) return false
  try {
    await api.ready?.()
    const installed = await api.listInstalled?.()
    const app = (installed || []).find(a => a?.id === appId)
    if (!app) return false
    const association = await api.getInstallation?.(app)
    return !!association && association.state !== 'system' && association.installed !== false
  } catch (_) {
    return false
  }
}

function hideIconMenu() {
  const el = document.getElementById('icon-context-menu')
  el?.classList.remove('show')
  if (icon.show) {
    icon.show = false
    icon.el = null
    setTimeout(() => { if (!icon.show) icon.canUninstall = false }, 150)
  }
}

async function onIconPick(text) {
  const el = icon.el
  hideIconMenu()
  if (!el || !el.isConnected) return
  if (text === '打开') {
    // 直接触发图标本身的点击，和鼠标点图标行为完全一致
    try { el.click() } catch (_) {}
    return
  }
  if (text === '隐藏图标') {
    // 一键隐藏，不确认；恢复走桌面菜单的动态项
    await hideDesktopIcon(el)
    return
  }
  if (text === '移除关联') {
    const ok = window.confirm('确定移除该功能的桌面关联吗？程序文件和个人数据会保留。')
    if (!ok) return
    try {
      await registryApi()?.uninstall?.(el.dataset.functionId, { retainData: true })
    } catch (error) {
      window.alert(error?.message || '功能移除失败。')
    }
  }
}

async function hideDesktopIcon(el) {
  const appId = el.dataset?.functionId || ''
  const api = registryApi()
  // 注册表图标：走现有的桌面显示开关（功能管理里可恢复）
  if (appId && api) {
    try {
      await api.ready?.()
      await api.setDesktopVisible?.(appId, false)
      return
    } catch (_) {}
  }
  // 静态图标：一键隐藏 + 本地持久化（桌面菜单动态项恢复）
  if (el.id && !appId) {
    const hidden = readStaticHidden()
    if (!hidden.includes(el.id)) {
      hidden.push(el.id)
      writeStaticHidden(hidden)
    }
    el.style.display = 'none'
    try {
      window.dispatchEvent(new CustomEvent('webwindows:desktop-icons-changed'))
    } catch (_) {}
  }
}
let suppressTouchClickUntil = 0
let longPressTimer = null
let longPressPointerId = null
let longPressStartX = 0
let longPressStartY = 0

function clearLongPress() {
  if (longPressTimer != null) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  longPressPointerId = null
}

function onPointerDown(event) {
  if (event.pointerType === 'mouse' || event.button !== 0) return
  const target = event.target
  if (!target?.closest) return
  if (target.closest('#start-menu, #custom-context-menu, #icon-context-menu, #window-context-menu')) return

  const windowHeader = target.closest('.window-header')
  const taskbarApp = target.closest('.taskbar-app')
  const desktopIcon = target.closest('.desktop .icon')
  const desktop = target.closest('.desktop')
  if (!windowHeader && !taskbarApp && !desktop) return
  if (windowHeader?.querySelector('.buttons')?.contains(target)) return

  longPressPointerId = event.pointerId
  longPressStartX = event.clientX
  longPressStartY = event.clientY
  longPressTimer = window.setTimeout(() => {
    longPressTimer = null
    suppressTouchClickUntil = Date.now() + 700
    if (windowHeader) {
      const win = windowHeader.closest('.window')
      if (win) {
        hideDeskMenu()
        W.showWindowContextMenu?.(
          { preventDefault() {}, pageX: longPressStartX, pageY: longPressStartY },
          win.id.replace(/^win-/, '')
        )
      }
      return
    }
    if (taskbarApp) {
      const id = (taskbarApp.dataset.id || '').replace(/^win-/, '')
      hideDeskMenu()
      hideIconMenu()
      W.showWindowContextMenu?.(
        { preventDefault() {}, pageX: longPressStartX, pageY: longPressStartY },
        id
      )
      return
    }
    if (desktopIcon && desktopIcon.isConnected) {
      hideDeskMenu()
      hideWindowMenu()
      showIconMenu(longPressStartX, longPressStartY, desktopIcon)
      return
    }
    hideWindowMenu()
    hideIconMenu()
    showDeskMenu(longPressStartX, longPressStartY)
  }, 520)
}

function onPointerMove(event) {
  if (event.pointerId !== longPressPointerId) return
  if (Math.hypot(event.clientX - longPressStartX, event.clientY - longPressStartY) > 12) {
    clearLongPress()
  }
}

function onPointerEnd(event) {
  if (event.pointerId !== longPressPointerId) return
  clearLongPress()
}

function onGlobalClick(event) {
  if (Date.now() < suppressTouchClickUntil) {
    event.preventDefault()
    event.stopImmediatePropagation()
    suppressTouchClickUntil = 0
    return
  }
  // 菜单内的点击交给菜单项自己处理：先全局隐藏会清空图标菜单的目标元素，
  // 导致菜单项拿不到被点的图标（各菜单项自己负责关闭菜单）。
  if (event.target?.closest?.('#custom-context-menu, #icon-context-menu')) return
  hideDeskMenu()
  hideIconMenu()
  hideWindowMenu()
}

/* ---------------- 窗口右键绑定（关键部分） ---------------- */
/**
 * 为窗口绑定右键：优先调用你 main.js 的 showWindowContextMenu(e, winId)
 * 若该方法不存在或 #window-context-menu 不在 DOM，则回退为简单定位显示。
 */
function bindWindowContext(winEl) {
  const header = winEl.querySelector('.window-header') || winEl
  const buttons = header.querySelector?.('.buttons')

  const handler = (e) => {
    // 不影响最小化/最大化/关闭按钮
    if (buttons && buttons.contains(e.target)) return
    e.preventDefault()

    // 关掉桌面菜单
    hideDeskMenu()

    // ✅ 直接复用你已有的方法（任务栏右键就是用的它）
    if (typeof W.showWindowContextMenu === 'function') {
      W.showWindowContextMenu(e, winEl.id) // 这里传完整 DOM id（形如 win-xxx）
      return
    }

    // ⬇️ 兜底：若上面方法不存在，则手动定位 #window-context-menu
    const menu = document.getElementById('window-context-menu')
    if (!menu) return
    menu.style.display = 'block' // 需先显示才能量宽高
    const mw = menu.offsetWidth, mh = menu.offsetHeight
    const vw = window.innerWidth, vh = window.innerHeight
    let left = e.pageX, top = e.pageY
    if (left + mw > vw) left = vw - mw - 8
    if (top + mh > vh) top = vh - mh - 8
    menu.style.left = left + 'px'
    menu.style.top = top + 'px'
  }

  header.addEventListener('contextmenu', handler, { capture: true, passive: false })
  winEl.__ctx = { target: header, handler }
}
function unbindWindowContext(winEl) {
  const s = winEl.__ctx
  if (s) { s.target.removeEventListener('contextmenu', s.handler, { capture: true }); delete winEl.__ctx }
}
function hideWindowMenu() {
  // 复用你的全局关闭；否则做兜底
  if (typeof W.hideWindowContextMenu === 'function') return W.hideWindowContextMenu()
  const el = document.getElementById('window-context-menu'); if (el) el.style.display = 'none'
}

/* ---------------- 生命周期 ---------------- */
let mo = null
function onHiddenStorage(event) {
  if (event?.key === STATIC_HIDDEN_KEY) refreshHiddenCount()
}
function onInstallationChanged() {
  refreshHiddenCount()
}
onMounted(() => {
  refreshHiddenCount()
  window.addEventListener('storage', onHiddenStorage)
  window.addEventListener('webwindows:desktop-icons-changed', refreshHiddenCount)
  window.addEventListener('webwindows:installation-changed', onInstallationChanged)
  // 全局：捕获阶段，保证优先于其他脚本拿到事件
  window.addEventListener('contextmenu', onGlobalContext, true)
  window.addEventListener('click', onGlobalClick, true)
  window.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('pointermove', onPointerMove, true)
  window.addEventListener('pointerup', onPointerEnd, true)
  window.addEventListener('pointercancel', onPointerEnd, true)

  // 初始已有窗口
  document.querySelectorAll('.window').forEach(bindWindowContext)

  // 监听后续新打开的窗口（openWindow 动态插入）
  mo = new MutationObserver((muts) => {
    muts.forEach(m => {
      m.addedNodes.forEach(n => {
        if (n instanceof HTMLElement && n.classList?.contains('window')) bindWindowContext(n)
      })
      m.removedNodes.forEach(n => {
        if (n instanceof HTMLElement && n.classList?.contains('window')) unbindWindowContext(n)
      })
    })
  })
  mo.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onHiddenStorage)
  window.removeEventListener('webwindows:desktop-icons-changed', refreshHiddenCount)
  window.removeEventListener('webwindows:installation-changed', onInstallationChanged)
  window.removeEventListener('contextmenu', onGlobalContext, true)
  window.removeEventListener('click', onGlobalClick, true)
  window.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('pointermove', onPointerMove, true)
  window.removeEventListener('pointerup', onPointerEnd, true)
  window.removeEventListener('pointercancel', onPointerEnd, true)
  clearLongPress()
  mo?.disconnect()
  document.querySelectorAll('.window').forEach(unbindWindowContext)
})
</script>
