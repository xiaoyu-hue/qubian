import { useLayoutEffect, useRef, useState } from 'react'
import { useTheme, type ThemeMode } from '../../app/providers'

const options: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
]

/** 主题三态切换（浅/深/跟随系统），用于设置页等正文区域。液态玻璃胶囊 + 滑动药丸。 */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const index = options.findIndex((option) => option.value === theme)
    const el = refs.current[index]
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [theme])

  return (
    <div className="glass-pill inline-flex gap-0.5 p-1" role="group" aria-label="主题模式">
      {pill && (
        <span
          aria-hidden="true"
          className="glass-pill--active pointer-events-none absolute top-1 bottom-1 rounded-full transition-[left,width] duration-300 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            refs.current[index] = el
          }}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={[
            'relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            theme === option.value ? 'text-accent-ink' : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
