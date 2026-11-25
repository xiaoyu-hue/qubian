/**
 * 双答案面板（PRD F03，核心差异化）。
 * - 专业版 / 大白话版切换，默认大白话；
 * - 未解锁时显示「主动求助」入口，用户可提前查看（会记录求助）；
 * - 无障碍：tablist 语义 + 方向键流转（与 SegmentedControl 同口径）。
 */
import { useRef, useState, type KeyboardEvent } from 'react'
import type { Answer } from '../../data/types'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'

type AnswerMode = 'plain' | 'professional'

const MODES: { value: AnswerMode; label: string }[] = [
  { value: 'plain', label: '大白话' },
  { value: 'professional', label: '专业版' },
]

export interface AnswerPanelProps {
  answer: Answer
  /** 是否已解锁（答完题后为 true）；未解锁时显示求助入口 */
  unlocked: boolean
  /** 点击主动求助（提前查看） */
  onAskHelp: () => void
}

export function AnswerPanel({ answer, unlocked, onAskHelp }: AnswerPanelProps) {
  const [mode, setMode] = useState<AnswerMode>('plain')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % MODES.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + MODES.length) % MODES.length
    else return
    event.preventDefault()
    setMode(MODES[next].value)
    refs.current[next]?.focus()
  }

  if (!unlocked) {
    return (
      <GlassCard tone="subtle" className="p-5 text-center">
        <p className="mb-3 text-sm text-muted">答案解析答完题后解锁</p>
        <Button variant="secondary" size="sm" onClick={onAskHelp}>
          我先看看答案
        </Button>
      </GlassCard>
    )
  }

  return (
    <GlassCard tone="subtle" className="p-5">
      <div
        role="tablist"
        aria-label="答案解析版本"
        className="mb-4 inline-flex gap-0.5 rounded-lg bg-accent-soft p-0.5"
      >
        {MODES.map((m, index) => (
          <button
            key={m.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            tabIndex={mode === m.value ? 0 : -1}
            onClick={() => setMode(m.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={[
              'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              mode === m.value ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p role="tabpanel" className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {mode === 'plain' ? answer.plain : answer.professional}
      </p>
    </GlassCard>
  )
}
