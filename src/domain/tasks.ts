import type { DailyTask } from '../data/types'

/**
 * 每日任务领域层（纯函数）。
 */

/**
 * 生成某一天的每日任务。
 * @param intensity 每日目标题数（用户设置的强度）
 * @param date 日期标识（YYYY-MM-DD，由调用方按本地日期生成）
 */
export function buildDailyTask(intensity: number, date: string): DailyTask {
  return {
    date,
    target: Math.max(1, Math.floor(intensity)),
    completed: 0,
    claimed: false,
  }
}

/**
 * 判断任务是否完成（完成数达到目标）。
 */
export function isTaskComplete(progress: DailyTask): boolean {
  return progress.completed >= progress.target
}

/**
 * 判断任务是否为「今天」的任务（跨天重置依据）。
 */
export function isSameDay(task: DailyTask, today: string): boolean {
  return task.date === today
}
