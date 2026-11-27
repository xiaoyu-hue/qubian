import { describe, expect, it } from 'vitest'
import type { Achievement, AchievementDefinition } from '../data/types'
import { calcLevel, checkAchievements, eligibleAchievementIds, isTriggerMet } from './progression'

describe('calcLevel', () => {
  const thresholds = [0, 100, 300]

  it('积分未达阈值时为 1 级', () => {
    expect(calcLevel(50, thresholds)).toBe(1)
  })

  it('达到阈值升级', () => {
    expect(calcLevel(100, thresholds)).toBe(2)
    expect(calcLevel(300, thresholds)).toBe(3)
  })

  it('空阈值表返回 1 级', () => {
    expect(calcLevel(999, [])).toBe(1)
  })
})

describe('checkAchievements', () => {
  const defs: Achievement[] = [
    { id: 'first', title: '初次答题', description: '' },
    { id: 'streak', title: '连续学习', description: '' },
  ]

  it('筛出未解锁的成就', () => {
    expect(checkAchievements(defs, ['first']).map((a) => a.id)).toEqual(['streak'])
  })

  it('全部已解锁时返回空', () => {
    expect(checkAchievements(defs, ['first', 'streak'])).toEqual([])
  })
})

describe('isTriggerMet / eligibleAchievementIds', () => {
  const defs: AchievementDefinition[] = [
    { id: 'first', title: '', description: '', trigger: { kind: 'answers', count: 1 } },
    { id: 'ten', title: '', description: '', trigger: { kind: 'answers', count: 10 } },
    { id: 'daily', title: '', description: '', trigger: { kind: 'daily-task' } },
    { id: 'streak3', title: '', description: '', trigger: { kind: 'streak', days: 3 } },
  ]

  it('答对数条件：达标才满足', () => {
    expect(isTriggerMet(defs[0].trigger, { answeredCount: 1, dailyTaskDone: false, streak: 0 })).toBe(true)
    expect(isTriggerMet(defs[1].trigger, { answeredCount: 9, dailyTaskDone: false, streak: 0 })).toBe(false)
  })

  it('每日任务条件', () => {
    expect(isTriggerMet(defs[2].trigger, { answeredCount: 0, dailyTaskDone: true, streak: 0 })).toBe(true)
    expect(isTriggerMet(defs[2].trigger, { answeredCount: 5, dailyTaskDone: false, streak: 0 })).toBe(false)
  })

  it('连续天数条件：达到才算', () => {
    expect(isTriggerMet(defs[3].trigger, { answeredCount: 0, dailyTaskDone: false, streak: 3 })).toBe(true)
    expect(isTriggerMet(defs[3].trigger, { answeredCount: 0, dailyTaskDone: false, streak: 2 })).toBe(false)
  })

  it('汇总满足条件的成就 id', () => {
    expect(eligibleAchievementIds(defs, { answeredCount: 10, dailyTaskDone: true, streak: 2 })).toEqual([
      'first', 'ten', 'daily',
    ])
  })
})
