import type { ResolvedTheme, ThemeMode } from '../data/types'

/**
 * 主题解析（纯函数）。
 * 规则（PRD F10）：
 * - light → 浅色
 * - dark → 深色
 * - system → 跟随系统偏好
 */
export function resolveTheme(pref: ThemeMode, system: ResolvedTheme): ResolvedTheme {
  if (pref === 'system') return system
  return pref
}
