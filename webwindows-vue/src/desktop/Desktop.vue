<template>
  <div class="ww-desktop">
    <div class="ww-wallpaper"></div>
    <WindowManager />
    <Taskbar />
  </div>
</template>

<script setup>
import WindowManager from './WindowManager.vue'
import Taskbar from './Taskbar.vue'
</script>

<style>
.ww-desktop{ position:fixed; inset:0; background:#0e1116; }
.ww-wallpaper{ position:absolute; inset:0; background:radial-gradient(60% 40% at 50% 30%, #223 0%, #111 60%, #0e1116 100%); filter:contrast(1.1) saturate(1.1); }
</style>
