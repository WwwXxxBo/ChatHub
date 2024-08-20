import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 解决跨域问题
  server:{
    port: 3000,
    open: true,
    proxy: {
      '/tongyi':{
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tongyi/, '')
      },
      '/stepfun':{
        target: 'https://api.stepfun.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stepfun/, '')
      },
      '/ernie':{
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ernie/, '')
      },
    },
    cors: true
  }
})
