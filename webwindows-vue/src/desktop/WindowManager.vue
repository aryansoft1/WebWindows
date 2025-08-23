<template>
  <!-- 空容器：不改变现有 DOM，只负责在 mounted 时挂上旧的行为 -->
  <div class="wm-bridge" style="display:none"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

// === 平行搬运的“旧行为绑定” ===
// 说明：这段里只“查找现有 .window”，然后按你 main.js 的旧逻辑给它们加事件。
// 选择器/类名/按钮名保持不变；你可以把 main.js 里的对应代码块原封不动粘进来。
function bindLegacyWindowBehaviors() {
  const wins = document.querySelectorAll('.window')
  wins.forEach(win => {
    const header = win.querySelector('.window-header'); if (!header) return;

    let isDragging = false, offsetX = 0, offsetY = 0;
    // 如果你旧代码里有 isMaximized/prev/toggleMaximize/minimize/close 之类，直接原样搬过来：
    let isMaximized = false;
    let prev = {};

    function toggleMaximize() {
      if (!isMaximized) {
        prev = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = (window.innerWidth) + 'px';
        win.style.height = (window.innerHeight - (document.querySelector('.taskbar')?.offsetHeight || 0)) + 'px';
        isMaximized = true;
      } else {
        win.style.left = prev.left; win.style.top = prev.top; win.style.width = prev.width; win.style.height = prev.height;
        isMaximized = false;
      }
    }

    const maximizeBtn = win.querySelector('.btn-maximize, .btn[title="最大化"], .btn-max'); // 按你的旧选择器改
    const minimizeBtn = win.querySelector('.btn-minimize, .btn[title="最小化"], .btn-min');
    const closeBtn = win.querySelector('.btn-close, .btn[title="关闭"], .btn.close');

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.style.zIndex = 9998; // bring to front（与旧值一致）
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      const snap = 20;
      const maxW = window.innerWidth - win.offsetWidth;
      const maxH = window.innerHeight - win.offsetHeight;
      if (Math.abs(x) < snap) x = 0;
      if (Math.abs(x - maxW) < snap) x = maxW;
      if (Math.abs(y) < snap) y = 0;
      if (Math.abs(y - maxH) < snap) y = maxH;
      win.style.left = x + 'px';
      win.style.top = y + 'px';
    });
    document.addEventListener('mouseup', () => isDragging = false);

    header.addEventListener('dblclick', () => toggleMaximize());
    maximizeBtn?.addEventListener('click', () => toggleMaximize());
    minimizeBtn?.addEventListener('click', () => {
      win.style.display = 'none';
      // 保持旧任务栏 API 不变
      window.updateTaskbarActive && window.updateTaskbarActive(win.id.replace('win-', ''), false);
      window.updateTaskbarActive && window.updateTaskbarActive(win.id, false);
    });
    closeBtn?.addEventListener('click', () => {
      // 按你的旧逻辑：移除任务栏图标、清理 iframe 等
      const id = win.id.replace('win-', '');
      try { window.removeTaskbarIcon && window.removeTaskbarIcon('win-' + id) } catch (e) { }
      win.remove();
    });

    // 如有右键菜单等，也按旧逻辑搬过来（选择器/函数名不变）
    // header.addEventListener('contextmenu', (e)=>{ ... showWindowContextMenu(e, win.id) ... })
  })
}

onMounted(() => { bindLegacyWindowBehaviors() })
onBeforeUnmount(() => { /* 如有全局事件需要解绑，可在这里处理 */ })
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
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid #ccc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.window-header {
    height: 36px;
    background: #ccc;
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
  cursor: pointer;
  transition: filter 0.2s;
}

.window-header .button:hover {
  filter: brightness(1.2);
}


.window {
  will-change: top, left;
  transition: none !important;
}


.window-header {
  height: 36px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
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
  cursor: pointer;
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
</style>