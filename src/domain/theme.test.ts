import { describe, expect, it } from 'vitest'
import { resolveTheme } from './theme'

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
