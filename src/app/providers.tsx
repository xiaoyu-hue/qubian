import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ResolvedTheme, ThemeMode } from '../data/types'
import { resolveTheme } from '../domain/theme'
import { useSettingsStore } from '../stores/settingsStore'

export type { ThemeMode } from '../data/types'

interface ThemeContextValue {
  /** 用户偏好（system / light / dark） */
  theme: ThemeMode
  /** 实际生效主题（light / dark），由偏好 + 系统解析得出 */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** 读取当前系统配色偏好；无 matchMedia 环境时回退浅色 */
function readSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSettingsStore((state) => state.settings.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme)

  // 跟随系统时，系统配色变化要实时反映（PRD F10）
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = resolveTheme(theme, systemTheme)

  // 显式写入解析后的主题；CSS 变量按 data-theme 命中对应令牌
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return ctx
}
