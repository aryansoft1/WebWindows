
<template>
  <div
    class="ww-window"
    :style="styleObj"
    @mousedown="focusMe"
  >
    <div class="ww-titlebar" @mousedown.prevent="beginDrag">
      <div class="ww-title">{{ win.title }}</div>
      <div class="ww-actions">
        <button @click.stop="toggleMin">—</button>
        <button @click.stop="toggleMax">{{ win.maximized ? '🗗' : '🗖' }}</button>
        <button @click.stop="closeMe">✕</button>
      </div>
    </div>

    <div class="ww-body" v-show="!win.minimized">
      <!-- iframe 模式（未迁移老模块） -->
      <iframe v-if="win.url" :src="win.url" frameborder="0" style="width:100%;height:100%"></iframe>

      <!-- 组件模式（已迁移 Vue 模块） -->
      <component v-else :is="AppRegistry[win.appKey]" />
    </div>

    <!-- 右下角缩放把手 -->
    <div class="ww-resizer" @mousedown.stop.prevent="beginResize"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { windowsStore } from '../stores/windows'
import { AppRegistry } from '../apps'

const props = defineProps({
  win: { type: Object, required: true }
})

const styleObj = computed(() => ({
  position: 'absolute',
  left: props.win.x + 'px',
  top:  props.win.y + 'px',
  width: props.win.w + 'px',
  height: props.win.h + 'px',
  zIndex: props.win.z,
}))

function focusMe()      { windowsStore.focus(props.win.id) }
function closeMe()      { windowsStore.close(props.win.id) }
function toggleMin()    { windowsStore.toggleMin(props.win.id) }
function toggleMax()    { windowsStore.toggleMax(props.win.id) }

let dragging = false, lastX=0, lastY=0
function beginDrag(e){
  dragging = true
  lastX = e.clientX; lastY = e.clientY
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup',   endDrag)
}
function onDrag(e){
  if (!dragging) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  windowsStore.move(props.win.id, dx, dy)
  lastX = e.clientX; lastY = e.clientY
}
function endDrag(){
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup',   endDrag)
}

let resizing = false, lastRX=0, lastRY=0
function beginResize(e){
  resizing = true
  lastRX = e.clientX; lastRY = e.clientY
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup',   endResize)
}
function onResize(e){
  if (!resizing) return
  const dw = e.clientX - lastRX
  const dh = e.clientY - lastRY
  windowsStore.resize(props.win.id, dw, dh)
  lastRX = e.clientX; lastRY = e.clientY
}
function endResize(){
  resizing = false
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup',   endResize)
}

onBeforeUnmount(() => { endDrag(); endResize() })
</script>

<style>
.ww-window { background:#fff; border:1px solid #aaa; box-shadow:0 6px 18px rgba(0,0,0,.2); border-radius:8px; overflow:hidden; }
.ww-titlebar{ height:36px; background:#f2f2f2; display:flex; align-items:center; justify-content:space-between; padding:0 8px; cursor:move; user-select:none; }
.ww-title{ font-weight:600; }
.ww-actions button{ margin-left:6px; }
.ww-body{ width:100%; height:calc(100% - 36px); }
.ww-resizer{ position:absolute; right:0; bottom:0; width:16px; height:16px; cursor:nwse-resize; background:linear-gradient(135deg, transparent 50%, #ccc 50%); }
</style>
