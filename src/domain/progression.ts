import type { Achievement } from '../data/types'

/**
 * 成长领域层（纯函数）：等级计算与成就触发。
 * 等级阈值由调用方传入（data/config/progression 配置），此处只做纯计算。
 */

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

/**
 * 从已有成就中筛选出本次新解锁的（id 尚未出现的）。
 * @param definitions 全部成就定义
 * @param unlockedIds 已解锁 id 集合
 */
export function checkAchievements(
  definitions: Achievement[],
  unlockedIds: string[],
): Achievement[] {
  const unlocked = new Set(unlockedIds)
  return definitions.filter((item) => !unlocked.has(item.id))
}
