import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Store 单测：Node 环境无 localStorage，用最小内存实现 mock。
 * 覆盖 F10 三条中的「手动覆盖 + 刷新保持」与容错回退。
 */
function createStorageMock() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
    key: (index: number) => [...data.keys()][index] ?? null,
    clear: () => data.clear(),
    get length() {
      return data.size
    },
  }
}

describe('settingsStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
    vi.resetModules()
  })

  it('默认主题为跟随系统', async () => {
    const { useSettingsStore } = await import('./settingsStore')
    expect(useSettingsStore.getState().settings.theme).toBe('system')
  })

  it('手动切换后即时持久化，重新加载仍保持（刷新不丢）', async () => {
    const first = await import('./settingsStore')
    first.useSettingsStore.getState().setTheme('light')

    // 模拟刷新：清模块缓存后重新导入，Store 会从仓储读回
    vi.resetModules()
    const second = await import('./settingsStore')
    expect(second.useSettingsStore.getState().settings.theme).toBe('light')

    second.useSettingsStore.getState().setTheme('dark')
    vi.resetModules()
    const third = await import('./settingsStore')
    expect(third.useSettingsStore.getState().settings.theme).toBe('dark')
  })

  it('损坏的持久化主题值回退为跟随系统', async () => {
    // 直接写入一个版本号正确、但 theme 非法的 envelopes
    localStorage.setItem(
      'qubian:v1:settings',
      JSON.stringify({
        version: 1,
        data: { theme: 'auto', taskIntensity: 5, onboardingDone: false },
      }),
    )
    vi.resetModules()
    const { useSettingsStore } = await import('./settingsStore')
    expect(useSettingsStore.getState().settings.theme).toBe('system')
  })

  it('存储内容无法解析时整体回退默认值，不抛错', async () => {
    localStorage.setItem('qubian:v1:settings', '{broken json')
    vi.resetModules()
    const { useSettingsStore } = await import('./settingsStore')
    expect(useSettingsStore.getState().settings).toEqual({
      theme: 'system',
      taskIntensity: 5,
      onboardingDone: false,
      language: 'python',
    })
  })

  it('非法学习强度被拒绝，合法值取整写入', async () => {
    const { useSettingsStore } = await import('./settingsStore')
    useSettingsStore.getState().setTaskIntensity(-3)
    expect(useSettingsStore.getState().settings.taskIntensity).toBe(5)
    useSettingsStore.getState().setTaskIntensity(7.9)
    expect(useSettingsStore.getState().settings.taskIntensity).toBe(7)
  })
})
