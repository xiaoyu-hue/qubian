/**
 * 用户档案状态（Zustand Store）。
 * 职责：金币、积分、等级、答题记录、购买记录的唯一状态源。
 * 约束：数值计算委托 domain 纯函数，持久化统一走仓储封装。
 */
import { create } from 'zustand'
import { readStored, writeStored } from '../data/repositories/storage'
import type { Achievement, UserProfile } from '../data/types'
import { COIN_REWARDS, POINTS_PER_CORRECT } from '../data/config/economy'
import { ACHIEVEMENTS, LEVEL_THRESHOLDS } from '../data/config/progression'
import { awardCoins, canAfford, spendCoins } from '../domain/economy'
import { calcLevel } from '../domain/progression'

const PROFILE_KEY = 'profile'

const DEFAULT_PROFILE: UserProfile = {
  coins: 0,
  points: 0,
  level: 1,
  answeredIds: [],
  revealedIds: [],
  purchasedBookIds: [],
  readBookIds: [],
}

/** 读取档案并对每个字段做合法性校验，损坏值回退默认 */
function loadProfile(): UserProfile {
  const stored = readStored<Partial<UserProfile>>(PROFILE_KEY, {})
  const answeredIds = Array.isArray(stored.answeredIds)
    ? stored.answeredIds.filter((id): id is string => typeof id === 'string')
    : []
  const revealedIds = Array.isArray(stored.revealedIds)
    ? stored.revealedIds.filter((id): id is string => typeof id === 'string')
    : []
  const purchasedBookIds = Array.isArray(stored.purchasedBookIds)
    ? stored.purchasedBookIds.filter((id): id is string => typeof id === 'string')
    : []
  const readBookIds = Array.isArray(stored.readBookIds)
    ? stored.readBookIds.filter((id): id is string => typeof id === 'string')
    : []
  const points =
    typeof stored.points === 'number' && Number.isFinite(stored.points) && stored.points >= 0
      ? stored.points
      : 0
  return {
    coins:
      typeof stored.coins === 'number' && Number.isFinite(stored.coins) && stored.coins >= 0
        ? stored.coins
        : 0,
    points,
    // 等级由积分推导，避免存储值与积分不一致
    level: calcLevel(points, LEVEL_THRESHOLDS),
    answeredIds,
    revealedIds,
    purchasedBookIds,
    readBookIds,
  }
}

interface ProfileState {
  profile: UserProfile
  /**
   * 答对一题：发金币、加积分、记录题号，返回是否新解锁成就。
   * 幂等：同一题重复答对不再重复发奖（防止无限刷金币），只返回空数组。
   */
  awardCorrect: (questionId: string) => Achievement[]
  /** 记录主动求助（提前看解析）：只解锁解析，不计入掌握、不发奖励 */
  revealAnswer: (questionId: string) => void
  /** 购买小册子：余额足够则扣币并记录；不足返回 false */
  purchaseBook: (bookId: string, price: number) => boolean
  /** 判断金币是否足够支付某价格 */
  canAfford: (price: number) => boolean
  /**
   * 标记小册子读完并发放返币。
   * 前置条件：已购买；幂等：同一本只返一次币（防重复点击刷币）。
   * 返回本次是否实际发放，供 UI 决定提示语。
   */
  markBookRead: (bookId: string) => boolean
  /** 清除数据后重置为初始档案 */
  resetProfile: () => void
}

function persist(profile: UserProfile): void {
  writeStored(PROFILE_KEY, profile)
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: loadProfile(),

  awardCorrect: (questionId) => {
    const current = get().profile
    // 幂等：已答对的题不再重复发奖，避免反复提交同一题刷金币
    if (current.answeredIds.includes(questionId)) return []
    const coins = awardCoins(current.coins, COIN_REWARDS['answer-correct'])
    const points = current.points + POINTS_PER_CORRECT
    const answeredIds = [...current.answeredIds, questionId]
    const next: UserProfile = {
      ...current,
      coins,
      points,
      level: calcLevel(points, LEVEL_THRESHOLDS),
      answeredIds,
    }
    persist(next)
    set({ profile: next })

    // 成就触发：按已答对数判定（骨架，二期接入 UI 展示）
    const unlockedIds: string[] = []
    if (answeredIds.length >= 1) unlockedIds.push('first-answer')
    if (answeredIds.length >= 10) unlockedIds.push('ten-correct')
    return ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id))
  },

  revealAnswer: (questionId) => {
    const current = get().profile
    if (current.revealedIds.includes(questionId)) return
    const next: UserProfile = {
      ...current,
      revealedIds: [...current.revealedIds, questionId],
    }
    persist(next)
    set({ profile: next })
  },

  purchaseBook: (bookId, price) => {
    const current = get().profile
    if (current.purchasedBookIds.includes(bookId)) return true
    const newBalance = spendCoins(current.coins, price)
    if (newBalance === null) return false
    const next: UserProfile = {
      ...current,
      coins: newBalance,
      purchasedBookIds: [...current.purchasedBookIds, bookId],
    }
    persist(next)
    set({ profile: next })
    return true
  },

  canAfford: (price) => canAfford(get().profile.coins, price),

  markBookRead: (bookId) => {
    const current = get().profile
    // 未购买不给返币；已返过则幂等返回 false
    if (!current.purchasedBookIds.includes(bookId)) return false
    if (current.readBookIds.includes(bookId)) return false
    const coins = awardCoins(current.coins, COIN_REWARDS['book-read'])
    const next: UserProfile = {
      ...current,
      coins,
      readBookIds: [...current.readBookIds, bookId],
    }
    persist(next)
    set({ profile: next })
    return true
  },

  resetProfile: () => {
    persist(DEFAULT_PROFILE)
    set({ profile: { ...DEFAULT_PROFILE } })
  },
}))
