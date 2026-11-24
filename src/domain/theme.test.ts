import { describe, expect, it } from 'vitest'
import { isThemeMode, resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('手动浅色优先', () => {
    expect(resolveTheme('light', 'dark')).toBe('light')
  })

  it('手动深色优先', () => {
    expect(resolveTheme('dark', 'light')).toBe('dark')
  })

  it('跟随系统时使用系统偏好', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark')
    expect(resolveTheme('system', 'light')).toBe('light')
  })
})

describe('isThemeMode', () => {
  it('接受三个合法值', () => {
    expect(isThemeMode('system')).toBe(true)
    expect(isThemeMode('light')).toBe(true)
    expect(isThemeMode('dark')).toBe(true)
  })

  it('拒绝非法值（防止损坏的持久化数据污染状态）', () => {
    expect(isThemeMode('auto')).toBe(false)
    expect(isThemeMode('')).toBe(false)
    expect(isThemeMode(null)).toBe(false)
    expect(isThemeMode(undefined)).toBe(false)
    expect(isThemeMode(1)).toBe(false)
    expect(isThemeMode({})).toBe(false)
  })
})
