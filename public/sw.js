/**
 * 趣编 QuBian · Service Worker（PWA 离线能力）
 *
 * 策略：
 * - 预缓存应用外壳：首页 HTML、manifest、图标（几百 KB，不含 Pyodide）；
 * - 导航请求：网络优先，失败回退缓存首页（保证离线能打开）；
 * - 静态资源（带 hash 的 JS/CSS）：缓存优先，命中即用，未命中联网并缓存；
 * - Pyodide 大文件（约 13 MB）：不缓存，走网络，避免占用手机空间；
 * - 缓存名带版本号，新版本激活时自动清理旧缓存。
 *
 * 版本号由注册方通过 sw.js?v=xxx 传入，与 package.json 同步，无需手改本文件。
 */
const BASE = new URL('.', self.location.href).pathname
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE = `qubian-${VERSION}`
const SHELL = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}favicon.svg`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
]

/** 是否是需要跳过的 Pyodide 运行时资源 */
function isPyodide(url) {
  return url.pathname.includes('/pyodide/')
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const urls = [...SHELL]
      // SW 在页面 load 后才注册，首屏的 JS/CSS 请求已经发生、不会被本 SW 拦截。
      // 因此安装时主动读取首页 HTML，解析出带 hash 的构建产物一并预缓存，
      // 否则离线时 HTML 能打开但脚本加载失败、页面空白。
      try {
        const res = await fetch(`${BASE}index.html`)
        if (res.ok) {
          const html = await res.text()
          const assetRe = new RegExp(`(?:src|href)="([^"]*${BASE}assets/[^"]+)"`, 'g')
          for (const m of html.matchAll(assetRe)) urls.push(m[1])
        }
      } catch { /* 解析失败时退回仅缓存外壳 */ }
      const cache = await caches.open(CACHE)
      await cache.addAll(urls).catch(() => undefined) // 单个资源失败不阻断安装
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('qubian-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // 只处理同源
  if (isPyodide(url)) return // 大文件交回网络，不缓存

  // 导航请求：网络优先，离线回退缓存首页
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(`${BASE}index.html`, copy))
        return res
      }).catch(() => caches.match(`${BASE}index.html`).then((hit) => hit || Response.error()))
    )
    return
  }

  // 静态资源：缓存优先，用 URL 字符串匹配（规避 crossorigin 脚本请求 mode 差异），
  // 未命中则联网并写入缓存；离线且未缓存时返回明确失败而非挂起。
  event.respondWith(
    caches.match(req.url).then((hit) => {
      if (hit) return hit
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req.url, copy))
        }
        return res
      }).catch(() => Response.error())
    })
  )
})
