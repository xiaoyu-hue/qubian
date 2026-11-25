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

describe('profileStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
    vi.resetModules()
  })

  it('初始档案为空', async () => {
    const { useProfileStore } = await import('./profileStore')
    const p = useProfileStore.getState().profile
    expect(p.coins).toBe(0)
    expect(p.points).toBe(0)
    expect(p.level).toBe(1)
    expect(p.answeredIds).toEqual([])
  })

  it('答对一题：加金币、加积分、记录题号', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().awardCorrect('py-basics-001')
    const p = useProfileStore.getState().profile
    expect(p.coins).toBe(5)
    expect(p.points).toBe(10)
    expect(p.answeredIds).toContain('py-basics-001')
  })

  it('同一题重复答对只记一次题号，但金币积分按次累加（可重复练习）', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().awardCorrect('py-basics-001')
    useProfileStore.getState().awardCorrect('py-basics-001')
    const p = useProfileStore.getState().profile
    expect(p.answeredIds).toEqual(['py-basics-001'])
    expect(p.coins).toBe(10)
    expect(p.points).toBe(20)
  })

  it('购买小册子：余额足够扣币并记录，不足返回 false', async () => {
    const { useProfileStore } = await import('./profileStore')
    expect(useProfileStore.getState().purchaseBook('book-basics', 40)).toBe(false)
    useProfileStore.getState().awardCorrect('py-basics-001')
    useProfileStore.getState().awardCorrect('py-basics-002')
    // 答对 8 题才够 40 金币
    for (let i = 0; i < 6; i += 1) useProfileStore.getState().awardCorrect(`py-basics-${100 + i}`)
    const before = useProfileStore.getState().profile.coins
    expect(before).toBe(40)
    expect(useProfileStore.getState().purchaseBook('book-basics', 40)).toBe(true)
    expect(useProfileStore.getState().profile.coins).toBe(0)
    expect(useProfileStore.getState().profile.purchasedBookIds).toContain('book-basics')
  })

  it('刷新不丢：重新导入后档案保持', async () => {
    const first = await import('./profileStore')
    first.useProfileStore.getState().awardCorrect('py-basics-001')
    vi.resetModules()
    const second = await import('./profileStore')
    expect(second.useProfileStore.getState().profile.coins).toBe(5)
    expect(second.useProfileStore.getState().profile.answeredIds).toContain('py-basics-001')
  })

  it('等级由积分推导，与存储值不一致时以积分为准', async () => {
    // 手动塞入一条损坏数据：等级 99 但积分 0
    localStorage.setItem(
      'qubian:v1:profile',
      JSON.stringify({ version: 1, data: { coins: 0, points: 0, level: 99, answeredIds: [], purchasedBookIds: [] } }),
    )
    vi.resetModules()
    const reloaded = await import('./profileStore')
    expect(reloaded.useProfileStore.getState().profile.level).toBe(1)
  })

  it('清除数据后重置', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().awardCorrect('py-basics-001')
    useProfileStore.getState().resetProfile()
    expect(useProfileStore.getState().profile.coins).toBe(0)
    expect(useProfileStore.getState().profile.answeredIds).toEqual([])
  })
})
