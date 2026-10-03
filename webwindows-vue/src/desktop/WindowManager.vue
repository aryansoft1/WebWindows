<template>
  <!-- 空容器：不改变现有 DOM，只负责在 mounted 时挂上旧的行为 -->
  <div class="wm-bridge" style="display:none"> <Taskbar /> </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Taskbar from './Taskbar.vue' 
// === 平行搬运的“旧行为绑定” ===
// 说明：这段里只“查找现有 .window”，然后按你 main.js 的旧逻辑给它们加事件。
// 选择器/类名/按钮名保持不变；你可以把 main.js 里的对应代码块原封不动粘进来。
const ICON_POSITIONS_KEY = 'webwindows.desktop.iconPositions'
const MOBILE_ICON_POSITIONS_KEY = 'webwindows.mobile.iconPositions'
const ICON_GRID_GAP_X = 20
const ICON_GRID_GAP_Y = 20
const ICON_DRAG_THRESHOLD = 5
const desktopIconCleanup = []
let desktopLayoutResizeTimer = null
let desktopLayoutObserver = null
let desktopIconObserver = null
let desktopSelection = null

function updateWindowViewportMetrics() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight
  const taskbarHeight = document.querySelector('.taskbar')?.offsetHeight || 43
  document.documentElement.style.setProperty('--ww-viewport-height', `${viewportHeight}px`)
  document.documentElement.style.setProperty('--ww-taskbar-height', `${taskbarHeight}px`)
}

function isCompactDesktopLayout() {
  return window.matchMedia(
    '(max-width: 820px), (max-width: 1000px) and (max-height: 500px)'
  ).matches
}

function iconPositionsKey() {
  return isCompactDesktopLayout() ? MOBILE_ICON_POSITIONS_KEY : ICON_POSITIONS_KEY
}

function readIconPositions() {
  try {
    const positions = JSON.parse(localStorage.getItem(iconPositionsKey()) || '{}')
    return positions && typeof positions === 'object' ? positions : {}
  } catch (_) {
    return {}
  }
}

function hasSavedIconPositions() {
  return Object.keys(readIconPositions()).length > 0
}

function restoreIconPositions() {
  normalizeDesktopIconLayout(false)
}

function writeIconPositions(positions) {
  localStorage.setItem(iconPositionsKey(), JSON.stringify(positions))
}

function debugDesktopLayout(grid, savedCount, persisted) {
  if (localStorage.getItem('webwindows.debug.desktopLayout') !== '1') return
  console.debug('[DesktopLayout]', {
    viewport: { width: grid.icons[0]?.parentElement?.clientWidth || 0, height: grid.icons[0]?.parentElement?.clientHeight || 0 },
    rows: grid.rows,
    columns: grid.columns,
    icons: grid.icons.length,
    saved: savedCount,
    persisted
  })
}

function getDesktopGrid(desktop) {
  const icons = Array.from(desktop.querySelectorAll('.icon[id]'))
    .filter(icon => icon.style.display !== 'none' && getComputedStyle(icon).display !== 'none')
  const desktopStyle = getComputedStyle(desktop)
  const originX = parseFloat(desktopStyle.paddingLeft) || 20
  const originY = parseFloat(desktopStyle.paddingTop) || 20
  const paddingRight = parseFloat(desktopStyle.paddingRight) || 20
  const paddingBottom = parseFloat(desktopStyle.paddingBottom) || 20
  const iconWidth = Math.max(1, ...icons.map(icon => icon.offsetWidth || 76))
  const iconHeight = Math.max(1, ...icons.map(icon => icon.offsetHeight || 97))
  const stepX = iconWidth + ICON_GRID_GAP_X
  const stepY = iconHeight + ICON_GRID_GAP_Y
  const rows = Math.max(1, Math.floor(
    (desktop.clientHeight - originY - paddingBottom - iconHeight) / stepY
  ) + 1)
  const visibleColumns = Math.max(1, Math.floor(
    (desktop.clientWidth - originX - paddingRight - iconWidth) / stepX
  ) + 1)
  const columns = Math.max(visibleColumns, Math.ceil(icons.length / rows))

  return {
    icons,
    originX,
    originY,
    iconWidth,
    iconHeight,
    stepX,
    stepY,
    rows,
    columns,
    slotCount: rows * columns
  }
}

function slotToPosition(slot, grid) {
  const column = Math.floor(slot / grid.rows)
  const row = slot % grid.rows
  return {
    x: grid.originX + column * grid.stepX,
    y: grid.originY + row * grid.stepY
  }
}

function positionToSlot(x, y, grid) {
  const column = Math.max(0, Math.min(
    grid.columns - 1,
    Math.round((x - grid.originX) / grid.stepX)
  ))
  const row = Math.max(0, Math.min(
    grid.rows - 1,
    Math.round((y - grid.originY) / grid.stepY)
  ))
  return column * grid.rows + row
}

function findNearestFreeSlot(desiredSlot, occupied, grid) {
  const desiredColumn = Math.floor(desiredSlot / grid.rows)
  const desiredRow = desiredSlot % grid.rows
  let bestSlot = null
  let bestDistance = Infinity

  for (let slot = 0; slot < grid.slotCount; slot += 1) {
    if (occupied.has(slot)) continue
    const column = Math.floor(slot / grid.rows)
    const row = slot % grid.rows
    const distance = ((column - desiredColumn) ** 2) + ((row - desiredRow) ** 2)
    if (distance < bestDistance || (distance === bestDistance && (bestSlot == null || slot < bestSlot))) {
      bestSlot = slot
      bestDistance = distance
    }
  }
  return bestSlot
}

function applyIconSlot(icon, slot, grid, positions) {
  if (slot == null) return
  const position = slotToPosition(slot, grid)
  icon.style.position = 'absolute'
  icon.style.left = `${position.x}px`
  icon.style.top = `${position.y}px`
  icon.style.zIndex = ''
  icon.dataset.wwGridSlot = String(slot)
  positions[icon.id] = position
}

function normalizeDesktopIconLayout(forceDomOrder = false, persist = false) {
  const desktop = document.querySelector('.desktop')
  if (!desktop) return
  const grid = getDesktopGrid(desktop)
  const positions = readIconPositions()
  const normalizedPositions = {}
  const occupied = new Set()

  const entries = grid.icons.map((icon, index) => ({ icon, index, saved: positions[icon.id] }))
  if (!forceDomOrder) {
    // Reserve every existing user's saved slot before placing a newly installed icon.
    entries.sort((a, b) => Number(Boolean(b.saved)) - Number(Boolean(a.saved)) || a.index - b.index)
  }

  entries.forEach(({ icon, index, saved }) => {
    const desiredSlot = !forceDomOrder && saved &&
      Number.isFinite(saved.x) && Number.isFinite(saved.y)
      ? positionToSlot(saved.x, saved.y, grid)
      : Math.min(index, grid.slotCount - 1)
    const slot = findNearestFreeSlot(desiredSlot, occupied, grid)
    if (slot == null) return
    occupied.add(slot)
    applyIconSlot(icon, slot, grid, normalizedPositions)
  })
  if (persist) writeIconPositions(normalizedPositions)
  debugDesktopLayout(grid, Object.keys(positions).length, persist)
  return normalizedPositions
}

function autoArrangeDesktopIcons() {
  normalizeDesktopIconLayout(true, true)
}

/* 图标恢复专用：删掉原格子占用，按“新图标”追加到当前布局末尾。
 * 隐藏 → 自动排列 → 再显示时，原位置大概率已有图标，直接恢复必然重叠。 */
function reinsertDesktopIcon(el) {
  const desktop = document.querySelector('.desktop')
  if (!desktop || !el || !el.isConnected) return false
  try {
    el.style.display = ''
    delete el.dataset.wwGridSlot
    const positions = readIconPositions()
    if (el.id) delete positions[el.id]
    const grid = getDesktopGrid(desktop)
    const occupied = new Set()
    grid.icons.forEach(other => {
      if (other === el) return
      const slot = Number(other.dataset.wwGridSlot)
      if (Number.isFinite(slot)) occupied.add(slot)
    })
    // 顺着排列顺序找第一个空格：原格子空着就回原位，
    // 被占了就跟在当前队尾后面（Windows 式从上到下、从左到右）。
    // 之前倒着找会掉到最后一列底部，在宽屏上变成右下角孤岛。
    let slot = 0
    while (slot < grid.slotCount && occupied.has(slot)) slot += 1
    if (slot >= grid.slotCount || occupied.has(slot)) {
      slot = findNearestFreeSlot(grid.slotCount - 1, occupied, grid) ?? 0
    }
    applyIconSlot(el, slot, grid, positions)
    writeIconPositions(positions)
    return true
  } catch (_) {
    return false
  }
}

function updateIconPositionState(id, x, y, options = {}) {
  if (!id || !Number.isFinite(x) || !Number.isFinite(y)) return
  if (options.userInitiated !== true && !hasSavedIconPositions()) return

  const positions = readIconPositions()
  positions[id] = { x, y }
  writeIconPositions(positions)
}

function handleDesktopLayoutResize() {
  clearTimeout(desktopLayoutResizeTimer)
  desktopLayoutResizeTimer = window.setTimeout(() => {
    normalizeDesktopIconLayout(false, false)
  }, 160)
}

function persistCurrentDesktopLayout(desktop) {
  const positions = {}
  getDesktopGrid(desktop).icons.forEach(icon => {
    const x = parseFloat(icon.style.left)
    const y = parseFloat(icon.style.top)
    if (Number.isFinite(x) && Number.isFinite(y)) positions[icon.id] = { x, y }
  })
  writeIconPositions(positions)
  return positions
}

async function stabilizeInitialDesktopLayout() {
  await document.fonts?.ready
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  normalizeDesktopIconLayout(false, false)
}

function setWallpaperByPath(path) {
    document.body.style.backgroundImage = `url('${path}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
}
document.addEventListener("DOMContentLoaded", () => {
    // 其他已有代码...

    // ✅ 加载保存的壁纸路径
    const savedWallpaper = localStorage.getItem("selectedWallpaper");
    if (savedWallpaper) {
        setWallpaperByPath(savedWallpaper);
    }
});
function makeDesktopIconsDraggable() {
  const desktop = document.querySelector('.desktop')
  if (!desktop) return
  if (!desktopSelection && window.WebWindowsFileSelection) {
    desktopSelection = window.WebWindowsFileSelection.create({
      container: desktop,
      itemSelector: '.desktop > .icon[id]',
      isSelectable: icon => icon.parentElement === desktop && getComputedStyle(icon).display !== 'none',
      isSurface: target => target === desktop,
      capture: true,
      openOnDoubleClick: true
    })
  }

  const icons = Array.from(desktop.querySelectorAll('.icon[id]'))
  icons.forEach(icon => {
    if (icon.dataset.wwPointerDragBound === '1') return
    icon.dataset.wwPointerDragBound = '1'
    icon.draggable = false
    icon.querySelectorAll('img').forEach(image => {
      image.draggable = false
    })

    let pointerId = null
    let startClientX = 0
    let startClientY = 0
    let startLeft = 0
    let startTop = 0
    let startSlot = null
    let dragging = false
    let suppressClickUntil = 0
    let group = []

    const finishDrag = (event) => {
      if (pointerId == null) return
      if (event?.pointerId != null && event.pointerId !== pointerId) return
      const finishedPointerId = pointerId
      pointerId = null
      window.removeEventListener('pointermove', moveDrag, true)
      window.removeEventListener('pointerup', finishDrag, true)
      window.removeEventListener('pointercancel', finishDrag, true)
      window.removeEventListener('blur', finishDrag)

      if (dragging) {
        const grid = getDesktopGrid(desktop)
        const cancelled = event?.type === 'pointercancel' || event?.type === 'blur'
        if (cancelled) {
          group.forEach(entry => {
            entry.icon.style.left = `${entry.x}px`
            entry.icon.style.top = `${entry.y}px`
            entry.icon.style.zIndex = ''
          })
        } else if (group.length > 1) {
          const positions = persistCurrentDesktopLayout(desktop)
          const occupied = new Set()
          const moving = new Set(group.map(entry => entry.icon))
          // Reserve the group's snapped cells, then move any displaced icons
          // into the nearest free cells. Every icon occupies exactly one cell.
          group.forEach(entry => {
            const desired = positionToSlot(parseFloat(entry.icon.style.left), parseFloat(entry.icon.style.top), grid)
            const slot = findNearestFreeSlot(desired, occupied, grid)
            occupied.add(slot)
            applyIconSlot(entry.icon, slot, grid, positions)
          })
          const stationary = grid.icons.filter(other => !moving.has(other))
          stationary.sort((a, b) => Number(occupied.has(Number(a.dataset.wwGridSlot))) - Number(occupied.has(Number(b.dataset.wwGridSlot))))
          stationary.forEach(other => {
            const slot = findNearestFreeSlot(Number(other.dataset.wwGridSlot), occupied, grid)
            occupied.add(slot)
            applyIconSlot(other, slot, grid, positions)
          })
          writeIconPositions(positions)
        } else {
        const desiredSlot = positionToSlot(
          parseFloat(icon.style.left) || grid.originX,
          parseFloat(icon.style.top) || grid.originY,
          grid
        )
        const positions = persistCurrentDesktopLayout(desktop)
        const targetIcon = grid.icons.find(other =>
          other !== icon && Number(other.dataset.wwGridSlot) === desiredSlot
        )

        // 目标格已占用时交换位置，保持 Windows 式网格排列，
        // 同时避免寻找远处空位造成横向拖动却纵向跳位。
        if (
          targetIcon &&
          Number.isFinite(startSlot) &&
          startSlot >= 0 &&
          startSlot < grid.slotCount &&
          startSlot !== desiredSlot
        ) {
          applyIconSlot(targetIcon, startSlot, grid, positions)
          applyIconSlot(icon, desiredSlot, grid, positions)
        } else {
          const occupied = new Set(
            grid.icons
              .filter(other => other !== icon)
              .map(other => Number(other.dataset.wwGridSlot))
              .filter(Number.isFinite)
          )
          const slot = findNearestFreeSlot(desiredSlot, occupied, grid)
          applyIconSlot(icon, slot, grid, positions)
        }
        writeIconPositions(positions)
        }
        suppressClickUntil = Date.now() + 350
      }

      dragging = false
      startSlot = null
      group.forEach(entry => { entry.icon.classList.remove('dragging'); entry.icon.style.zIndex = '' })
      group = []
      try {
        if (icon.hasPointerCapture(finishedPointerId)) {
          icon.releasePointerCapture(finishedPointerId)
        }
      } catch (_) {}
    }

    const moveDrag = (event) => {
      if (event.pointerId !== pointerId) return
      let deltaX = event.clientX - startClientX
      let deltaY = event.clientY - startClientY
      if (!dragging && Math.hypot(deltaX, deltaY) < ICON_DRAG_THRESHOLD) return

      dragging = true
      event.preventDefault()
      const grid = getDesktopGrid(desktop)
      const maxLeft = Math.max(grid.originX, desktop.clientWidth - grid.iconWidth - grid.originX)
      const maxTop = Math.max(grid.originY, desktop.clientHeight - grid.iconHeight - grid.originY)
      deltaX = Math.max(grid.originX - Math.min(...group.map(entry => entry.x)), Math.min(maxLeft - Math.max(...group.map(entry => entry.x)), deltaX))
      deltaY = Math.max(grid.originY - Math.min(...group.map(entry => entry.y)), Math.min(maxTop - Math.max(...group.map(entry => entry.y)), deltaY))
      group.forEach(entry => {
        entry.icon.classList.add('dragging')
        entry.icon.style.left = `${entry.x + deltaX}px`
        entry.icon.style.top = `${entry.y + deltaY}px`
        entry.icon.style.zIndex = '2'
      })
    }

    const startDrag = (event) => {
      if (isCompactDesktopLayout() || event.button !== 0 || pointerId != null) return
      if (event.ctrlKey || event.metaKey || event.shiftKey) return
      const desktopRect = desktop.getBoundingClientRect()
      const iconRect = icon.getBoundingClientRect()
      pointerId = event.pointerId
      startClientX = event.clientX
      startClientY = event.clientY
      startLeft = iconRect.left - desktopRect.left + desktop.scrollLeft
      startTop = iconRect.top - desktopRect.top + desktop.scrollTop
      startSlot = Number(icon.dataset.wwGridSlot)
      group = (desktopSelection?.isSelected(icon) ? desktopSelection.selection : [icon]).map(item => ({
        icon: item,
        x: parseFloat(item.style.left) || item.offsetLeft,
        y: parseFloat(item.style.top) || item.offsetTop
      }))
      dragging = false
      try { icon.setPointerCapture(pointerId) } catch (_) {}
      window.addEventListener('pointermove', moveDrag, true)
      window.addEventListener('pointerup', finishDrag, true)
      window.addEventListener('pointercancel', finishDrag, true)
      window.addEventListener('blur', finishDrag)
    }

    const suppressDraggedClick = (event) => {
      if (Date.now() >= suppressClickUntil) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    const preventNativeDrag = (event) => event.preventDefault()
    icon.addEventListener('pointerdown', startDrag)
    icon.addEventListener('click', suppressDraggedClick, true)
    icon.addEventListener('dragstart', preventNativeDrag)
    desktopIconCleanup.push(() => {
      finishDrag()
      icon.removeEventListener('pointerdown', startDrag)
      icon.removeEventListener('click', suppressDraggedClick, true)
      icon.removeEventListener('dragstart', preventNativeDrag)
      delete icon.dataset.wwPointerDragBound
    })
  })
}
onMounted(() => {
  restoreIconPositions()
  window.updateIconPositionState = updateIconPositionState
  window.autoArrangeDesktopIcons = autoArrangeDesktopIcons
  window.reinsertDesktopIcon = reinsertDesktopIcon
  makeDesktopIconsDraggable()
  updateWindowViewportMetrics()
  window.addEventListener('resize', handleDesktopLayoutResize)
  window.addEventListener('resize', updateWindowViewportMetrics)
  window.addEventListener('orientationchange', updateWindowViewportMetrics)
  window.visualViewport?.addEventListener('resize', updateWindowViewportMetrics)
  window.visualViewport?.addEventListener('resize', handleDesktopLayoutResize)
  const desktop = document.querySelector('.desktop')
  if (desktop && typeof ResizeObserver === 'function') {
    desktopLayoutObserver = new ResizeObserver(handleDesktopLayoutResize)
    desktopLayoutObserver.observe(desktop)
  }
  if (desktop && typeof MutationObserver === 'function') {
    desktopIconObserver = new MutationObserver(mutations => {
      if (!mutations.some(mutation => mutation.addedNodes.length)) return
      makeDesktopIconsDraggable()
      handleDesktopLayoutResize()
    })
    desktopIconObserver.observe(desktop, { childList: true })
  }
  stabilizeInitialDesktopLayout().catch(error => console.warn('[DesktopLayout] stabilization failed', error))
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleDesktopLayoutResize)
  window.removeEventListener('resize', updateWindowViewportMetrics)
  window.removeEventListener('orientationchange', updateWindowViewportMetrics)
  window.visualViewport?.removeEventListener('resize', updateWindowViewportMetrics)
  window.visualViewport?.removeEventListener('resize', handleDesktopLayoutResize)
  desktopLayoutObserver?.disconnect()
  desktopIconObserver?.disconnect()
  desktopLayoutObserver = null
  desktopIconObserver = null
  clearTimeout(desktopLayoutResizeTimer)
  desktopIconCleanup.splice(0).forEach(cleanup => cleanup())
  desktopSelection?.destroy()
  desktopSelection = null
  if (window.updateIconPositionState === updateIconPositionState) {
    delete window.updateIconPositionState
  }
  if (window.autoArrangeDesktopIcons === autoArrangeDesktopIcons) {
    delete window.autoArrangeDesktopIcons
  }
  if (window.reinsertDesktopIcon === reinsertDesktopIcon) {
    delete window.reinsertDesktopIcon
  }
})
</script>
<style>
:root{
  --wm-blur: 14px;
  --wm-glass-bg: rgba(255,255,255,.55);   /* 玻璃底色 */
  --wm-glass-border: rgba(255,255,255,.35);
}

.window {
  position: absolute;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 12px;
  border: 1px solid #ccc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  isolation: isolate;
  overflow: hidden;
  transition: all 0.3s ease;
}

.window-header {
    height: 36px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    color: #000;
    font-family: "Segoe UI", sans-serif;
    font-size: 13px;
}

.window-header .button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 8px;
  background: #e81123;
  --ww-cursor-state: var(--ww-cursor-link, pointer);cursor: var(--ww-cursor-link, pointer);
  transition: filter 0.2s;
}

.window-header .button:hover {
  filter: brightness(1.2);
}


.window {
  will-change: auto;
  transition: none;
}

/* 窗口特效（默认开；个性化 → 特效开关可关）。
 * 拖拽/缩放期间保持无过渡，保证跟手；只有显式动画类才走过渡。 */
html[data-ww-effects="off"] .window {
  transition: none !important;
  animation: none !important;
}

html[data-ww-effects="on"] .window.ww-anim-open {
  animation: ww-window-in 0.19s cubic-bezier(0.2, 0.9, 0.25, 1.05);
}

html[data-ww-effects="on"] .window.ww-anim-close {
  animation: ww-window-out 0.15s ease-in forwards;
}

html[data-ww-effects="on"] .window.ww-anim-min {
  animation: ww-window-min 0.16s ease-in forwards;
  pointer-events: none;
}

html[data-ww-effects="on"] .window.ww-anim-unmin {
  animation: ww-window-in 0.18s cubic-bezier(0.2, 0.9, 0.25, 1.05);
}

html[data-ww-effects="on"] .window.ww-anim-geom {
  transition: top 0.22s ease, left 0.22s ease, width 0.22s ease, height 0.22s ease;
}

@keyframes ww-window-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes ww-window-out {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.97) translateY(6px); }
}

@keyframes ww-window-min {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.9) translateY(28px); }
}

/* 个性化：毛玻璃强度（默认 10px，与原值一致；设置 → 个性化可调） */
.window-header {
  backdrop-filter: blur(var(--ww-acrylic-blur, 10px));
  -webkit-backdrop-filter: blur(var(--ww-acrylic-blur, 10px));
}

/* 个性化：活动窗口标题栏主题色（半透明玻璃质感，任何颜色都透出壁纸模糊） */
.window.active .window-header {
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--ww-accent, #0078d7) 58%, transparent),
    color-mix(in srgb, var(--ww-accent, #0078d7) 46%, transparent) 55%,
    color-mix(in srgb, var(--ww-accent, #0078d7) 62%, transparent));
  border-bottom-color: rgba(0, 0, 0, 0.22);
  box-shadow: none;
  backdrop-filter: blur(var(--ww-acrylic-blur, 10px)) saturate(1.35);
  -webkit-backdrop-filter: blur(var(--ww-acrylic-blur, 10px)) saturate(1.35);
}

.window.active .window-header,
.window.active .window-header .title {
  color: #fff;
}

.window.is-dragging,
.window.is-resizing {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.window.is-dragging .window-header,
.window.is-resizing .window-header {
  background: rgba(80, 190, 232, 0.72);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.window-header {
  height: 36px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.window-header .title {
  flex-grow: 1;
  user-select: none;
}

.window-header .buttons {
  display: flex;
  gap: 6px;
}

.window-header .button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  --ww-cursor-state: var(--ww-cursor-link, pointer);cursor: var(--ww-cursor-link, pointer);
  color:#FFF;
  transition: background 0.2s;
}

.window-header .button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.window-header .button.close:hover {
  background: #e81123;
}

.window-header .button svg {
  width: 14px;
  height: 14px;
  stroke: white;
  stroke-width: 2;
  fill: none;
}


.window,
.window * {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}


.weather-widget,
.weather-widget * {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.window-iframe{
  height: calc(100% - 30px); overflow: auto; background: rgb(255, 255, 255);
}

.window-header img.window-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.window-header .title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-grow: 1;
  color: #FFF;
}

/* 清理和统一 z-index 层级 */
.window {
  position: absolute;
  z-index: 100;
}

.window.active {
  z-index: 1000;
}

@media (max-width: 820px), (max-width: 1000px) and (max-height: 500px) {
  .window {
    box-sizing: border-box;
    position: fixed !important;
    inset: env(safe-area-inset-top) env(safe-area-inset-right)
      calc(var(--ww-taskbar-height, 43px) + env(safe-area-inset-bottom))
      env(safe-area-inset-left) !important;
    width: auto !important;
    height: calc(var(--ww-viewport-height, 100dvh) - var(--ww-taskbar-height, 43px) - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: none !important;
    border-radius: 0;
  }

  .window-content,
  .window-iframe {
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: 100% !important;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .window-content > iframe,
  .window-iframe > iframe {
    min-width: 0 !important;
    max-width: 100% !important;
  }

  .window-header {
    min-height: 48px;
    height: 48px;
    padding-inline: max(8px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-right));
    touch-action: manipulation;
  }

  .window-header .button {
    width: 44px;
    height: 44px;
    margin-left: 0;
  }

  .window > .resizer {
    display: none;
  }
}
</style>
