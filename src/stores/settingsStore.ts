/**
 * 设置状态（Zustand Store）。
 * 职责：主题偏好、每日强度、引导完成标志的唯一状态源。
 * 约束（架构 5.2 / 7.4）：
 * - 业务逻辑委托领域层，Store 只暴露动作；
 * - 持久化统一走仓储封装，不直接操作原生 localStorage。
 */
import { create } from 'zustand'
import { readStored, writeStored } from '../data/repositories/storage'
import type { Settings, ThemeMode } from '../data/types'
import { isThemeMode } from '../domain/theme'

const SETTINGS_KEY = 'settings'

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  taskIntensity: 5,
  onboardingDone: false,
}

/** 读取设置并对每个字段做合法性校验，损坏值回退默认 */
function loadSettings(): Settings {
  const stored = readStored<Partial<Settings>>(SETTINGS_KEY, {})
  return {
    theme: isThemeMode(stored.theme) ? stored.theme : DEFAULT_SETTINGS.theme,
    taskIntensity:
      typeof stored.taskIntensity === 'number' &&
      Number.isFinite(stored.taskIntensity) &&
      stored.taskIntensity > 0
        ? stored.taskIntensity
        : DEFAULT_SETTINGS.taskIntensity,
    onboardingDone:
      typeof stored.onboardingDone === 'boolean'
        ? stored.onboardingDone
        : DEFAULT_SETTINGS.onboardingDone,
  }
}

/** 写入一份完整设置（即时持久化） */
function saveSettings(settings: Settings): void {
  writeStored(SETTINGS_KEY, settings)
}

interface SettingsState {
  settings: Settings
  /** 设置主题偏好（system / light / dark） */
  setTheme: (theme: ThemeMode) => void
  /** 设置每日学习强度（正整数） */
  setTaskIntensity: (intensity: number) => void
  /** 标记引导已完成 */
  setOnboardingDone: (done: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: loadSettings(),

  setTheme: (theme) =>
    set((state) => {
      const next = { ...state.settings, theme }
      saveSettings(next)
      return { settings: next }
    }),

  setTaskIntensity: (intensity) =>
    set((state) => {
      if (!Number.isFinite(intensity) || intensity <= 0) return state
      const next = { ...state.settings, taskIntensity: Math.trunc(intensity) }
      saveSettings(next)
      return { settings: next }
    }),

  setOnboardingDone: (done) =>
    set((state) => {
      const next = { ...state.settings, onboardingDone: done }
      saveSettings(next)
      return { settings: next }
    }),
}))
