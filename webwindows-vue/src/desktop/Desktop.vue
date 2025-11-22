<!-- Desktop.vue -->
<template>
  <div class="ww-desktop">
    <div class="ww-wallpaper"></div>
    <WindowManager />
    <Taskbar />
    <!-- 统一右键菜单控制器 -->
    <DesktopContextMenus />
  </div>
</template>

<script setup lang="ts">
import DesktopContextMenus from './DesktopContextMenus.vue'  // ✅ 同目录相对导入
onMounted(() => { bindLegacyWindowBehaviors() })
</script>
