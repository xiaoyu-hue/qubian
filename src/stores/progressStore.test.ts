import { beforeEach, describe, expect, it, vi } from 'vitest'

function createStorageMock() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size
    },
  }
}

describe('progressStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
    vi.resetModules()
  })

  it('ensureToday 生成当天任务，同日重复调用不重置', async () => {
    const { useProgressStore } = await import('./progressStore')
    const t1 = useProgressStore.getState().ensureToday(5, '2026-11-25')
    expect(t1.date).toBe('2026-11-25')
    expect(t1.target).toBe(5)
    useProgressStore.getState().advanceTask(5, '2026-11-25')
    const t2 = useProgressStore.getState().ensureToday(5, '2026-11-25')
    expect(t2.completed).toBe(1)
  })

  it('advanceTask 推进进度，不超过目标', async () => {
    const { useProgressStore } = await import('./progressStore')
    useProgressStore.getState().ensureToday(2, '2026-11-25')
    useProgressStore.getState().advanceTask(2, '2026-11-25')
    useProgressStore.getState().advanceTask(2, '2026-11-25')
    useProgressStore.getState().advanceTask(2, '2026-11-25')
    expect(useProgressStore.getState().task?.completed).toBe(2)
  })

  it('跨天自动重置任务', async () => {
    const { useProgressStore } = await import('./progressStore')
    useProgressStore.getState().ensureToday(5, '2026-11-25')
    useProgressStore.getState().advanceTask(5, '2026-11-25')
    const t = useProgressStore.getState().ensureToday(5, '2026-11-26')
    expect(t.date).toBe('2026-11-26')
    expect(t.completed).toBe(0)
  })

  it('连续天数：相邻两天累加，断签重置为 1', async () => {
    const { useProgressStore } = await import('./progressStore')
    useProgressStore.getState().advanceTask(5, '2026-11-25')
    expect(useProgressStore.getState().streak).toBe(1)
    useProgressStore.getState().advanceTask(5, '2026-11-26')
    expect(useProgressStore.getState().streak).toBe(2)
    // 隔了 11-27、11-28，11-29 再来应重置为 1
    useProgressStore.getState().advanceTask(5, '2026-11-29')
    expect(useProgressStore.getState().streak).toBe(1)
  })

  it('同一天多次答题不重复累加连续天数', async () => {
    const { useProgressStore } = await import('./progressStore')
    useProgressStore.getState().advanceTask(5, '2026-11-25')
    useProgressStore.getState().advanceTask(5, '2026-11-25')
    expect(useProgressStore.getState().streak).toBe(1)
  })

  it('领取奖励后标记 claimed', async () => {
    const { useProgressStore } = await import('./progressStore')
    useProgressStore.getState().ensureToday(5, '2026-11-25')
    useProgressStore.getState().claimTask('2026-11-25')
    expect(useProgressStore.getState().task?.claimed).toBe(true)
  })

  it('刷新不丢', async () => {
    const first = await import('./progressStore')
    first.useProgressStore.getState().advanceTask(5, '2026-11-25')
    vi.resetModules()
    const second = await import('./progressStore')
    expect(second.useProgressStore.getState().task?.date).toBe('2026-11-25')
    expect(second.useProgressStore.getState().task?.completed).toBe(1)
  })
})
