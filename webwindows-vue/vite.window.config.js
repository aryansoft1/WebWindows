// webwindows-vue/vite.window.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  // ✅ 把 Node 环境变量替换成字面量，避免浏览器里出现 process
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}'           // 兼容有的库直接访问 process.env
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry-window-manager.js'),
      name: 'WindowManagerWidget',
      formats: ['iife', 'umd'],
      fileName: (format) => format === 'umd'
        ? 'window-manager-widget.umd.js'
        : 'window-manager-widget.js',
      cssFileName: 'window-manager-widget'
    },
    rollupOptions: {
      output: { exports: 'named' }
    },
    outDir: resolve(__dirname, '../dist-window')
  }
})
