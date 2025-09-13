// vite.weather.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist-weather',
    lib: {
      entry: resolve(__dirname, 'src/desktop/weather.vue'),
      name: 'WeatherTimeWidget',
      formats: ['umd','iife'],                 // 需要哪种就保留哪种
      fileName: (format) => format === 'umd'
        ? 'weather-widget.umd.js'             // ← 显式写 .js
        : 'weather-widget.global.js',         // ← 显式写 .js
      cssFileName: 'weather-widget'           // 避免 Vite7 的 CSS 命名报错
    },
    rollupOptions: {
      external: ['vue'],
      output: { globals: { vue: 'Vue' } }
    }
  }
})
