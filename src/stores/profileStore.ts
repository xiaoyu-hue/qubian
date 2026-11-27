/**
 * 用户档案状态（Zustand Store）。
 * 职责：金币、积分、等级、答题记录、错题队列、成就、购买记录的唯一状态源。
 * 约束：数值计算与规则判定委托 domain 纯函数，持久化统一走仓储封装。
 */
import { create } from 'zustand'
import { readStored, writeStored } from '../data/repositories/storage'
import type { Achievement, UserProfile } from '../data/types'
import { COIN_REWARDS, POINTS_PER_CORRECT } from '../data/config/economy'
import { ACHIEVEMENTS, LEVEL_THRESHOLDS } from '../data/config/progression'
import { awardCoins, canAfford, spendCoins } from '../domain/economy'
import {
  calcLevel,
  checkAchievements,
  eligibleAchievementIds,
  type AchievementStats,
} from '../domain/progression'
import { dequeueWrong, enqueueWrong } from '../domain/review'

const PROFILE_KEY = 'profile'

const DEFAULT_PROFILE: UserProfile = {
  coins: 0,
  points: 0,
  level: 1,
  answeredIds: [],
  revealedIds: [],
  purchasedBookIds: [],
  readBookIds: [],
  wrongIds: [],
  unlockedAchievements: [],
}

/** 读取字符串数组字段，损坏值回退空数组 */
function readIdArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string')
    : []
}

/** 读取已解锁成就：只保留字段完整的条目，旧数据缺 unlockedAt 时补空串 */
function readAchievements(value: unknown): Achievement[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.description === 'string',
    )
    .map((item) => ({
      id: item.id as string,
      title: item.title as string,
      description: item.description as string,
      ...(typeof item.unlockedAt === 'string' ? { unlockedAt: item.unlockedAt } : {}),
    }))
}

/** 读取档案并对每个字段做合法性校验，损坏值回退默认 */
function loadProfile(): UserProfile {
  const stored = readStored<Partial<UserProfile>>(PROFILE_KEY, {})
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
    answeredIds: readIdArray(stored.answeredIds),
    revealedIds: readIdArray(stored.revealedIds),
    purchasedBookIds: readIdArray(stored.purchasedBookIds),
    readBookIds: readIdArray(stored.readBookIds),
    wrongIds: readIdArray(stored.wrongIds),
    unlockedAchievements: readAchievements(stored.unlockedAchievements),
  }
}

interface ProfileState {
  profile: UserProfile
  /**
   * 答对一题：发金币、加积分、记录题号、移出错题队列。
   * 幂等：同一题重复答对不再重复发奖（防止无限刷金币）。
   */
  awardCorrect: (questionId: string) => void
  /**
   * 按统计快照判定并解锁成就、发放成就金币。
   * 幂等：已解锁 id 不再重复发奖；返回本次新解锁的成就供 UI 提示。
   */
  syncAchievements: (stats: AchievementStats) => Achievement[]
  /** 答错一题：加入错题队列（幂等），不发奖、不记掌握 */
  markWrong: (questionId: string) => void
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

/**
 * 成就判定：从定义中筛出「条件已满足且尚未解锁」的，补 unlockedAt 后写入档案并发奖。
 * 返回新解锁成就，全程幂等——已解锁 id 不再重复发奖。
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: loadProfile(),

  awardCorrect: (questionId) => {
    const current = get().profile
    // 幂等：已答对的题不再重复发奖，避免反复提交同一题刷金币
    if (current.answeredIds.includes(questionId)) return
    const coins = awardCoins(current.coins, COIN_REWARDS['answer-correct'])
    const points = current.points + POINTS_PER_CORRECT
    const next: UserProfile = {
      ...current,
      coins,
      points,
      level: calcLevel(points, LEVEL_THRESHOLDS),
      answeredIds: [...current.answeredIds, questionId],
      wrongIds: dequeueWrong(current.wrongIds, questionId),
    }
    persist(next)
    set({ profile: next })
  },

  syncAchievements: (stats) => {
    const current = get().profile
    const alreadyIds = current.unlockedAchievements.map((a) => a.id)
    const eligible = eligibleAchievementIds(ACHIEVEMENTS, stats)
    // 尚未解锁 ∩ 条件已满足，才是本次新解锁的
    const fresh = checkAchievements(ACHIEVEMENTS, alreadyIds)
      .filter((a) => eligible.includes(a.id))
      .map((a) => ({ ...a, unlockedAt: new Date().toISOString() }))
    if (fresh.length === 0) return []

    const coins = awardCoins(current.coins, COIN_REWARDS.achievement * fresh.length)
    const next: UserProfile = {
      ...current,
      coins,
      unlockedAchievements: [...current.unlockedAchievements, ...fresh],
    }
    persist(next)
    set({ profile: next })
    return fresh
  },

  markWrong: (questionId) => {
    const current = get().profile
    const wrongIds = enqueueWrong(current.wrongIds, questionId)
    if (wrongIds === current.wrongIds) return
    const next: UserProfile = { ...current, wrongIds }
    persist(next)
    set({ profile: next })
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
