import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  // GitHub Pages 项目站点部署在 /qubian/ 子路径下，资源需用绝对前缀才不会 404。
  // 本地 dev 与部署共用此值，保证 pyodide 的 import.meta.env.BASE_URL 一并正确。
  base: '/qubian/',
  // 版本号唯一真相源：从 package.json 读取注入全局常量，前端不写死版本号。
  // 供设置页「检查更新」与 Service Worker 缓存命名共用。
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
