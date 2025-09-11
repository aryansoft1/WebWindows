// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // 入口就是你的组件 SFC
      entry: 'src/desktop/ContextMenu.vue',
      name: 'ContextMenu',                  // IIFE 全局变量名：window.ContextMenu
      formats: ['iife', 'es'],                    // 导出两种格式
      fileName: (format) => format === 'iife' ? 'contextmenu-widget.global' : 'contextmenu-widget.es'
    },
    rollupOptions: {
      // 不把 Vue 打包进去（更小），用全局 CDN 方式提供 Vue
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }                   // IIFE 版里，window.Vue 会被当作 vue 依赖
      }
    }
  }
})
