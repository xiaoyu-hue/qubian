/**
 * 经济数值配置（对应 PRD F05、05 规范）。
 * 所有金币数值集中在此，调数值不改逻辑（实施计划风险表口径）。
 */
import type { CoinReason } from '../types'

/** 各原因的金币变动量（正数=产出，负数=消费） */
export const COIN_REWARDS: Record<CoinReason, number> = {
  'answer-correct': 5,
  'daily-task': 20,
  'book-read': 10,
  'book-purchase': -40,
  achievement: 15,
}

/** 答对一题同时获得的积分 */
export const POINTS_PER_CORRECT = 10

/** 小册子的解锁价格（金币） */
export const BOOKLET_PRICE = 40
