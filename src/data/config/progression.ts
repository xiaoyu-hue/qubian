/**
 * 成长数值配置（对应 PRD F07/F08/F13）。
 * 等级阈值：索引即等级-1，如 thresholds[1]=100 表示升到 Lv.2 需 100 积分。
 */
import type { AchievementDefinition } from '../types'

export const LEVEL_THRESHOLDS: number[] = [0, 100, 300, 600, 1000, 1500]

/**
 * 成就触发方式见 types.AchievementTrigger：
 * - answers：累计答对题数；- daily-task：完成每日任务；- streak：连续天数
 * 判定逻辑在 domain/progression，配置只声明条件。
 */
/** 成就定义（T2.6 完整实现：每条都带明确触发条件） */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-answer', title: '初次上手', description: '答对第一道题', trigger: { kind: 'answers', count: 1 } },
  { id: 'ten-correct', title: '小有积累', description: '累计答对 10 道题', trigger: { kind: 'answers', count: 10 } },
  { id: 'daily-done', title: '今日达标', description: '完成一次每日任务', trigger: { kind: 'daily-task' } },
  { id: 'streak-3', title: '三日不辍', description: '连续学习 3 天', trigger: { kind: 'streak', days: 3 } },
  { id: 'streak-7', title: '每周坚持', description: '连续学习 7 天', trigger: { kind: 'streak', days: 7 } },
]
