import { describe, expect, it } from 'vitest'
import { awardCoins, canAfford, spendCoins } from './economy'

describe('economy', () => {
  it('余额足够时可支付', () => {
    expect(canAfford(100, 50)).toBe(true)
    expect(canAfford(50, 50)).toBe(true)
  })

  it('余额不足或负数成本时不可支付', () => {
    expect(canAfford(30, 50)).toBe(false)
    expect(canAfford(100, -1)).toBe(false)
  })

  it('产出只增', () => {
    expect(awardCoins(10, 5)).toBe(15)
    expect(awardCoins(10, 0)).toBe(10)
  })

  it('消费扣减，不足返回 null', () => {
    expect(spendCoins(100, 30)).toBe(70)
    expect(spendCoins(20, 30)).toBeNull()
  })
})
