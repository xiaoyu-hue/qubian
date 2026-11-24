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

/**
 * 校验一个未知值是否是合法的主题偏好。
 * 用于读取持久化数据时，防止损坏/旧版数据把状态污染成非法值。
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}
