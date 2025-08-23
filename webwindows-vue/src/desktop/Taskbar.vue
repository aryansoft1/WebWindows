<template>
  <div class="ww-taskbar">
    <div
      v-for="w in windowsStore.windows"
      :key="w.id"
      class="ww-task"
      @click="toggle(w)"
      :title="w.title"
    >🪟 {{ w.title }}</div>
  </div>
</template>

<script setup>
import { windowsStore } from '../stores/windows'
function toggle(w){
  if (w.minimized) windowsStore.toggleMin(w.id)
  else windowsStore.focus(w.id)
}
</script>

<style>
.ww-taskbar{ position:absolute; left:0; right:0; bottom:0; height:40px; background:#222; color:#fff; display:flex; align-items:center; padding:0 6px; gap:6px; }
.ww-task{ background:#444; padding:6px 10px; border-radius:6px; cursor:pointer; }
.ww-task:hover{ background:#555; }
</style>
