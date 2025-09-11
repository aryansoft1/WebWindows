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
      <div class="context-menu-item" @click="onDeskPick('设置')">
        <span class="menu-icon">⚙️</span><span style="padding-left:10px">设置</span>
      </div>
      <div class="context-menu-item" @click="onDeskPick('个性化')">
        <span class="menu-icon">🖼️</span><span style="padding-left:10px">个性化</span>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, onMounted, onBeforeUnmount } from 'vue'

const W = window // 复用你 main.js 里的全局函数

/* ---------------- 桌面右键（已 OK） ---------------- */
const desk = reactive({ x: 0, y: 0, show: false })

function showDeskMenu(x, y) {
  desk.x = x; desk.y = y; desk.show = true
  requestAnimationFrame(() => document.getElementById('custom-context-menu')?.classList.add('show'))
}
function hideDeskMenu() {
  const el = document.getElementById('custom-context-menu')
  el?.classList.remove('show')
  setTimeout(() => { desk.show = false }, 150)
}
function onDeskPick(text) {
  hideDeskMenu()
  if (text === '刷新') W.refreshDesktop?.()
  if (text === '设置') W.openWindow?.('settings', '设置', 'settings.html', 'assets/icons/settings.png', true)
}

function onGlobalContext(e) {
  // 跟原生逻辑一致：window/taskbar/start-menu 内不弹桌面菜单
  e.preventDefault()
  const t = e.target
  if (t?.closest?.('.window')) return
  if (t?.closest?.('.taskbar')) return
  if (t?.closest?.('#start-menu')) return
  hideWindowMenu() // 如果窗口菜单开着，先关掉
  showDeskMenu(e.pageX, e.pageY)
}
function onGlobalClick() {
  hideDeskMenu()
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
onMounted(() => {
  // 全局：捕获阶段，保证优先于其他脚本拿到事件
  window.addEventListener('contextmenu', onGlobalContext, true)
  window.addEventListener('click', onGlobalClick, true)

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
  window.removeEventListener('contextmenu', onGlobalContext, true)
  window.removeEventListener('click', onGlobalClick, true)
  mo?.disconnect()
  document.querySelectorAll('.window').forEach(unbindWindowContext)
})
</script>
