import { describe, expect, it } from 'vitest'
import type { Achievement } from '../data/types'
import { calcLevel, checkAchievements } from './progression'

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
