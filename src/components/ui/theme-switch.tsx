import { useTheme, type ThemeMode } from '../../app/providers'

const options: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
]

/** 主题三态切换（浅/深/跟随系统），用于设置页等正文区域。 */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className="inline-flex gap-0.5 rounded-lg bg-accent-soft p-0.5"
      role="group"
      aria-label="主题模式"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={[
            'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            theme === option.value
              ? 'bg-accent text-accent-ink'
              : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
