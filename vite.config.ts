import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 项目站点部署在 /qubian/ 子路径下，资源需用绝对前缀才不会 404。
  // 本地 dev 与部署共用此值，保证 pyodide 的 import.meta.env.BASE_URL 一并正确。
  base: '/qubian/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
