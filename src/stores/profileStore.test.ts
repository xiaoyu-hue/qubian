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

  it('同一题重复答对不重复发奖（防刷金币）', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().awardCorrect('py-basics-001')
    useProfileStore.getState().awardCorrect('py-basics-001')
    const p = useProfileStore.getState().profile
    expect(p.answeredIds).toEqual(['py-basics-001'])
    expect(p.coins).toBe(5)
    expect(p.points).toBe(10)
  })

  it('主动求助只解锁解析，不计入掌握、不发奖励', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().revealAnswer('py-basics-002')
    const p = useProfileStore.getState().profile
    expect(p.revealedIds).toContain('py-basics-002')
    expect(p.answeredIds).toEqual([])
    expect(p.coins).toBe(0)
    expect(p.points).toBe(0)
  })

  it('求助后答对仍正常发奖', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().revealAnswer('py-basics-002')
    useProfileStore.getState().awardCorrect('py-basics-002')
    const p = useProfileStore.getState().profile
    expect(p.answeredIds).toContain('py-basics-002')
    expect(p.coins).toBe(5)
  })

  it('缺少 revealedIds 的旧数据能正常加载', async () => {
    localStorage.setItem(
      'qubian:v1:profile',
      JSON.stringify({ version: 1, data: { coins: 5, points: 10, level: 1, answeredIds: ['py-basics-001'], purchasedBookIds: [] } }),
    )
    vi.resetModules()
    const reloaded = await import('./profileStore')
    const p = reloaded.useProfileStore.getState().profile
    expect(p.revealedIds).toEqual([])
    expect(p.coins).toBe(5)
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

  it('读完返币：已购买可领，未购买不发', async () => {
    const { useProfileStore } = await import('./profileStore')
    // 未购买时点读完不发币
    expect(useProfileStore.getState().markBookRead('book-basics')).toBe(false)
    expect(useProfileStore.getState().profile.coins).toBe(0)

    // 攒够 40 金币购买
    for (let i = 0; i < 8; i += 1) useProfileStore.getState().awardCorrect(`q-${i}`)
    useProfileStore.getState().purchaseBook('book-basics', 40)
    expect(useProfileStore.getState().profile.coins).toBe(0)

    // 读完返 10 金币
    expect(useProfileStore.getState().markBookRead('book-basics')).toBe(true)
    expect(useProfileStore.getState().profile.coins).toBe(10)
    expect(useProfileStore.getState().profile.readBookIds).toContain('book-basics')
  })

  it('读完返币幂等：同一本重复领取不再发币', async () => {
    const { useProfileStore } = await import('./profileStore')
    for (let i = 0; i < 8; i += 1) useProfileStore.getState().awardCorrect(`q-${i}`)
    useProfileStore.getState().purchaseBook('book-basics', 40)
    expect(useProfileStore.getState().markBookRead('book-basics')).toBe(true)
    expect(useProfileStore.getState().markBookRead('book-basics')).toBe(false)
    expect(useProfileStore.getState().profile.coins).toBe(10)
    expect(useProfileStore.getState().profile.readBookIds).toEqual(['book-basics'])
  })

  it('缺少 readBookIds 的旧数据能正常加载', async () => {
    localStorage.setItem(
      'qubian:v1:profile',
      JSON.stringify({ version: 1, data: { coins: 5, points: 10, level: 1, answeredIds: [], purchasedBookIds: [] } }),
    )
    vi.resetModules()
    const reloaded = await import('./profileStore')
    expect(reloaded.useProfileStore.getState().profile.readBookIds).toEqual([])
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

  // ---- T2.8 错题队列 ----
  it('答错入队，重复答错幂等', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().markWrong('q-wrong')
    useProfileStore.getState().markWrong('q-wrong')
    expect(useProfileStore.getState().profile.wrongIds).toEqual(['q-wrong'])
    // 入队不发奖、不记掌握
    expect(useProfileStore.getState().profile.coins).toBe(0)
    expect(useProfileStore.getState().profile.answeredIds).toEqual([])
  })

  it('答对后移出错题队列', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().markWrong('q-wrong')
    useProfileStore.getState().awardCorrect('q-wrong')
    expect(useProfileStore.getState().profile.wrongIds).toEqual([])
    expect(useProfileStore.getState().profile.answeredIds).toContain('q-wrong')
  })

  it('缺少 wrongIds 的旧数据能正常加载', async () => {
    localStorage.setItem(
      'qubian:v1:profile',
      JSON.stringify({ version: 1, data: { coins: 5, points: 10, level: 1, answeredIds: [], purchasedBookIds: [] } }),
    )
    vi.resetModules()
    const reloaded = await import('./profileStore')
    expect(reloaded.useProfileStore.getState().profile.wrongIds).toEqual([])
  })

  // ---- T2.6 成就系统 ----
  it('条件满足时解锁成就并发放金币', async () => {
    const { useProfileStore } = await import('./profileStore')
    const unlocked = useProfileStore.getState().syncAchievements({
      answeredCount: 1,
      dailyTaskDone: false,
      streak: 1,
    })
    const ids = unlocked.map((a) => a.id)
    expect(ids).toContain('first-answer')
    expect(useProfileStore.getState().profile.coins).toBe(15)
    const record = useProfileStore.getState().profile.unlockedAchievements.find((a) => a.id === 'first-answer')
    expect(record?.unlockedAt).toBeTruthy()
  })

  it('成就重复同步不再发币（幂等）', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().syncAchievements({ answeredCount: 1, dailyTaskDone: false, streak: 1 })
    const again = useProfileStore.getState().syncAchievements({ answeredCount: 1, dailyTaskDone: false, streak: 1 })
    expect(again).toEqual([])
    expect(useProfileStore.getState().profile.coins).toBe(15)
    expect(useProfileStore.getState().profile.unlockedAchievements).toHaveLength(1)
  })

  it('一次可解锁多个成就，按数量发币', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().syncAchievements({
      answeredCount: 10,
      dailyTaskDone: true,
      streak: 3,
    })
    // first-answer / ten-correct / daily-done / streak-3 共 4 个
    expect(useProfileStore.getState().profile.unlockedAchievements).toHaveLength(4)
    expect(useProfileStore.getState().profile.coins).toBe(60)
  })

  it('条件未满足不解锁', async () => {
    const { useProfileStore } = await import('./profileStore')
    useProfileStore.getState().syncAchievements({ answeredCount: 0, dailyTaskDone: false, streak: 0 })
    expect(useProfileStore.getState().profile.unlockedAchievements).toEqual([])
    expect(useProfileStore.getState().profile.coins).toBe(0)
  })

  it('缺少 unlockedAchievements 的旧数据能正常加载', async () => {
    localStorage.setItem(
      'qubian:v1:profile',
      JSON.stringify({ version: 1, data: { coins: 5, points: 10, level: 1, answeredIds: [], purchasedBookIds: [] } }),
    )
    vi.resetModules()
    const reloaded = await import('./profileStore')
    expect(reloaded.useProfileStore.getState().profile.unlockedAchievements).toEqual([])
  })
})
