import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string | number> {
  options: readonly Option<T>[]
  value: T
  onChange: (value: T) => void
  /** 无障碍分组标签 */
  ariaLabel: string
  className?: string
}

/**
 * 分段档位选择器：用于设置页「每日强度」、双答案切换等少量离散选项。
 * 液态玻璃胶囊：整条是玻璃药丸槽，选中项用滑动的实心药丸指示。
 * 无障碍：radio 语义 + 方向键流转 + roving tabindex（选中项可 Tab 进入，
 * 进入后方向键在选项间移动，符合 ARIA radiogroup 规范）。
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  // 选中药丸跟随选中项：位置由真实 DOM 尺寸算出，兼容标签长短不一与字体加载
  useLayoutEffect(() => {
    const index = options.findIndex((option) => option.value === value)
    const el = refs.current[index]
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [options, value])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % options.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + options.length) % options.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = options.length - 1
    } else {
      return
    }
    event.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      className={`glass-pill inline-flex gap-0.5 p-1 ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {pill && (
        <span
          aria-hidden="true"
          className="glass-pill--active pointer-events-none absolute top-1 bottom-1 rounded-full transition-[left,width] duration-300 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={[
              'relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              selected ? 'text-accent-ink' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
