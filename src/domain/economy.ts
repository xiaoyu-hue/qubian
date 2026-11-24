import type { CoinReason } from '../data/types'

/**
 * 经济领域层（纯函数）。数值来源由调用方传入（来自 data/config/economy.ts），此处不含魔数。
 */

/** 判断余额是否足够支付 */
export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost && cost >= 0
}

/** 计算产出后的新余额（只增） */
export function awardCoins(balance: number, amount: number): number {
  return amount > 0 ? balance + amount : balance
}

/**
 * 计算消费后的新余额。余额不足时返回 null，由调用方决定如何提示差额。
 */
export function spendCoins(balance: number, cost: number): number | null {
  if (!canAfford(balance, cost)) return null
  return balance - cost
}

/** 金币变动原因的类型守卫，便于 config 查表 */
export function isCoinReason(value: string): value is CoinReason {
  return [
    'answer-correct',
    'daily-task',
    'book-read',
    'book-purchase',
    'achievement',
  ].includes(value)
}
