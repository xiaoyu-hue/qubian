/**
 * 检查更新：调用 GitHub 公开 API 查询最新 Release，与当前版本比较。
 * 纯逻辑 + fetch，不依赖 React，便于单测；无后端、无需令牌。
 */

export type UpdateState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'up-to-date'; latest: string }
  | { status: 'available'; latest: string; url: string }
  | { status: 'error'; message: string }

export const RELEASES_URL = 'https://github.com/xiaoyu-hue/qubian/releases'
const API_URL = 'https://api.github.com/repos/xiaoyu-hue/qubian/releases/latest'

/** 解析语义化版本号为数字数组（忽略 v 前缀与预发布后缀），无法解析返回 null */
export function parseVersion(input: string): number[] | null {
  const clean = input.trim().replace(/^v/, '').split(/[-+]/)[0]
  if (!clean) return null
  const parts = clean.split('.')
  if (parts.length !== 3 || parts.some((p) => !/^\d+$/.test(p))) return null
  return parts.map(Number)
}

/** 比较版本号：a > b 返回 1，相等 0，a < b 返回 -1；无法解析按字符串兜底 */
export function compareVersion(a: string, b: string): number {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (!pa || !pb) return a === b ? 0 : a > b ? 1 : -1
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] > pb[i] ? 1 : -1
  }
  return 0
}

/**
 * 查询是否有新版本。返回结构化结果，调用方据此渲染四态。
 * 超时 8 秒，失败返回 error 态（离线场景常见）。
 */
export async function checkForUpdate(currentVersion: string): Promise<UpdateState> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return { status: 'error', message: `请求失败（HTTP ${res.status}）` }
    const data = (await res.json()) as { tag_name?: string; html_url?: string }
    const latest = data.tag_name?.replace(/^v/, '') || ''
    if (!latest) return { status: 'error', message: '无法解析最新版本号' }
    if (compareVersion(latest, currentVersion) > 0) {
      return { status: 'available', latest, url: data.html_url || RELEASES_URL }
    }
    return { status: 'up-to-date', latest }
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    return { status: 'error', message: aborted ? '请求超时，请检查网络' : '网络不可用，请稍后重试' }
  } finally {
    clearTimeout(timer)
  }
}
