/**
 * Service Worker 注册与更新检测。
 *
 * 仅在支持 Service Worker 且为 HTTPS / localhost 时注册（PWA 硬性要求）。
 * 注册时把应用版本号作为查询参数传给 sw.js，SW 用它命名缓存，
 * 发版后版本号变化 → 新 SW 安装 → 自动清理旧缓存，无需手改 SW 文件。
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  // 开发模式下 Vite HMR 与 SW 缓存会互相干扰，只在生产环境注册
  if (!import.meta.env.PROD) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js?v=${__APP_VERSION__}`)
      .catch(() => undefined) // 注册失败不影响应用主流程
  })
}
