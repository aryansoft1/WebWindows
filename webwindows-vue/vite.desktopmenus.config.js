// webwindows-vue/vite.desktopmenus.config.js
// @ts-nocheck
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, '../dist-menus'),
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/desktop/desktop-menus.entry.ts'),
      name: 'DesktopMenusWidget',
      formats: ['iife'],
      // 这里随便，真正起作用的是下面 output.entryFileNames
      fileName: () => 'desktop-menus.global'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        // ✅ 强制主入口叫这个名字（带 .js）
        entryFileNames: 'desktop-menus.global.js',
        // 其他产物随便
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
