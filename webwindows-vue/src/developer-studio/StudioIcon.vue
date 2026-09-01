<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 16 }
});
</script>

<template>
  <svg class="studio-icon" :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true">
    <path v-if="name === 'file-add'" d="M6 2.75h7l5 5V21.25H6zM13 3v5h5M12 11v7m-3.5-3.5h7" />
    <path v-else-if="name === 'folder-add'" d="M3 6.25h7l2 2h9v11H3zM12 11v6m-3-3h6" />
    <path v-else-if="name === 'rename'" d="m4 17.5 1-4L15.75 2.75l3.5 3.5L8.5 17zM13.75 4.75l3.5 3.5M3.5 21h17" />
    <path v-else-if="name === 'delete'" d="M4 6.5h16M9 6.5V3.25h6V6.5m3 0-1 14.25H7L6 6.5m4 4v6.5m4-6.5V17" />
    <path v-else-if="name === 'explorer'" d="M3.5 4h17v16h-17zM9 4v16M5.5 8h1M5.5 12h1" />
    <path v-else-if="name === 'panel'" d="M3.5 4h17v16h-17zM3.5 14.5h17" />
    <path v-else-if="name === 'inspector'" d="M3.5 4h17v16h-17zM15 4v16M17.5 8h1" />
    <path v-else-if="name === 'sun'" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    <path v-else-if="name === 'moon'" d="M19.5 15.5A8 8 0 0 1 8.5 4.5a8 8 0 1 0 11 11Z" />
    <path v-else-if="name === 'more'" d="M5 12h.01M12 12h.01M19 12h.01" />
  </svg>
</template>

<style scoped>
.studio-icon { display: block; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
</style>
