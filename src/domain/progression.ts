import type {
  Achievement,
  AchievementDefinition,
  AchievementTrigger,
} from '../data/types'

/**
 * 成长领域层（纯函数）：等级计算与成就触发判定。
 * 等级阈值与成就定义由调用方传入（data/config/progression 配置），此处只做纯计算。
 */

/** 成就判定所需的统计快照（由调用方从各 Store 汇总，领域层不读状态） */
export interface AchievementStats {
  answeredCount: number
  dailyTaskDone: boolean
  streak: number
}

/**
 * 依据积分计算等级。
 * @param points 当前积分（只增）
 * @param thresholds 各等级所需积分阈值，索引即等级，如 [0, 100, 300] 表示 Lv.1/2/3
 */
export function calcLevel(points: number, thresholds: number[]): number {
  if (thresholds.length === 0) return 1
  let level = 1
  for (let i = 1; i < thresholds.length; i += 1) {
    if (points >= thresholds[i]) level = i + 1
    else break
  }
  return level
}

/** 判断单个成就的触发条件是否满足 */
export function isTriggerMet(trigger: AchievementTrigger, stats: AchievementStats): boolean {
  switch (trigger.kind) {
    case 'answers':
      return stats.answeredCount >= trigger.count
    case 'daily-task':
      return stats.dailyTaskDone
    case 'streak':
      return stats.streak >= trigger.days
  }
}

/**
 * 从成就定义中找出「条件已满足」的 id（不考虑是否已解锁，去重由 Store 负责）。
 */
export function eligibleAchievementIds(
  definitions: AchievementDefinition[],
  stats: AchievementStats,
): string[] {
  return definitions.filter((d) => isTriggerMet(d.trigger, stats)).map((d) => d.id)
}

/**
 * 从成就定义中筛出尚未解锁的（id 不在 unlockedIds 中的）。
 */
export function checkAchievements(
  definitions: Achievement[],
  unlockedIds: string[],
): Achievement[] {
  const unlocked = new Set(unlockedIds)
  return definitions.filter((item) => !unlocked.has(item.id))
}
