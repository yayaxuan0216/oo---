import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 後端的網址與 Port
        changeOrigin: true,              // 解決跨域問題
        // 如果後端路由沒有 /api 前綴，可以把下面這行註解打開來去掉 /api
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})
