import { describe, expect, it } from 'vitest'
import { buildDailyTask, isSameDay, isTaskComplete } from './tasks'

describe('buildDailyTask', () => {
  it('按强度生成目标，完成数归零', () => {
    const task = buildDailyTask(5, '2026-11-25')
    expect(task).toEqual({ date: '2026-11-25', target: 5, completed: 0, claimed: false })
  })

  it('强度至少为 1', () => {
    expect(buildDailyTask(0, '2026-11-25').target).toBe(1)
  })
})

describe('isTaskComplete', () => {
  it('完成数达标返回 true', () => {
    expect(isTaskComplete({ date: '2026-11-25', target: 3, completed: 3, claimed: false })).toBe(true)
    expect(isTaskComplete({ date: '2026-11-25', target: 3, completed: 2, claimed: false })).toBe(false)
  })
})

describe('isSameDay', () => {
  it('跨天返回 false，用于重置', () => {
    const task = buildDailyTask(5, '2026-11-24')
    expect(isSameDay(task, '2026-11-24')).toBe(true)
    expect(isSameDay(task, '2026-11-25')).toBe(false)
  })
})
