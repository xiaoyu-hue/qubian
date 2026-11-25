/**
 * 学习进度状态（Zustand Store）。
 * 职责：每日任务进度、连续打卡天数的唯一状态源。
 * 约束：跨天判定委托 domain 纯函数，持久化走仓储封装。
 */
import { create } from 'zustand'
import { readStored, writeStored } from '../data/repositories/storage'
import type { DailyTask } from '../data/types'
import { buildDailyTask, isSameDay } from '../domain/tasks'

const PROGRESS_KEY = 'progress'

/** 本地日期标识 YYYY-MM-DD（不用 toISOString，避免 UTC 偏移导致跨天错误） */
export function localDate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface ProgressData {
  task: DailyTask | null
  streak: number
  lastActiveDate: string | null
}

interface ProgressState extends ProgressData {
  /** 确保今天的任务存在（跨天则重建），返回当前任务 */
  ensureToday: (intensity: number, today?: string) => DailyTask
  /** 完成一题，推进今日任务进度；跨天自动重置 */
  advanceTask: (intensity: number, today?: string) => DailyTask
  /** 领取任务奖励后标记 claimed */
  claimTask: (today?: string) => void
  /** 清除数据后重置 */
  resetProgress: () => void
}

function loadProgress(): ProgressData {
  const stored = readStored<Partial<ProgressData>>(PROGRESS_KEY, {})
  return {
    task: stored.task && typeof stored.task === 'object' ? stored.task : null,
    streak: typeof stored.streak === 'number' && stored.streak >= 0 ? stored.streak : 0,
    lastActiveDate:
      typeof stored.lastActiveDate === 'string' ? stored.lastActiveDate : null,
  }
}

function persist(data: ProgressData): void {
  writeStored(PROGRESS_KEY, data)
}

export const useProgressStore = create<ProgressState>((set, get) => {
  /** 计算连续天数：昨天连续则 +1，今天已计则不变，断签则重置为 1 */
  function nextStreak(today: string): { streak: number; lastActiveDate: string } {
    const { lastActiveDate, streak } = get()
    if (lastActiveDate === today) return { streak, lastActiveDate: today }
    // 基于传入的 today 计算昨天，不读系统时钟——保证可测试、且与调用方的"今天"口径一致
    const yesterday = localDate(new Date(new Date(`${today}T12:00:00`).getTime() - 86400000))
    const next = lastActiveDate === yesterday ? streak + 1 : 1
    return { streak: next, lastActiveDate: today }
  }

  return {
    ...loadProgress(),

    ensureToday: (intensity, today = localDate()) => {
      const { task } = get()
      if (task && isSameDay(task, today)) return task
      const fresh = buildDailyTask(intensity, today)
      persist({ ...get(), task: fresh })
      set({ task: fresh })
      return fresh
    },

    advanceTask: (intensity, today = localDate()) => {
      const current = get()
      let task = current.task
      if (!task || !isSameDay(task, today)) {
        task = buildDailyTask(intensity, today)
      }
      const updated: DailyTask = { ...task, completed: Math.min(task.completed + 1, task.target) }
      const streakInfo = nextStreak(today)
      persist({ task: updated, ...streakInfo })
      set({ task: updated, ...streakInfo })
      return updated
    },

    claimTask: (today = localDate()) => {
      const { task } = get()
      if (!task || !isSameDay(task, today)) return
      const updated = { ...task, claimed: true }
      persist({ ...get(), task: updated })
      set({ task: updated })
    },

    resetProgress: () => {
      const fresh: ProgressData = { task: null, streak: 0, lastActiveDate: null }
      persist(fresh)
      set(fresh)
    },
  }
})
