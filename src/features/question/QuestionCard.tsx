/**
 * 题目卡：选择题作答交互（PRD F02/F04）。
 * - 选项用 radio 语义 + roving tabindex（方向键流转）；
 * - 提交后给出对错反馈，答对由上层发金币；
 * - 判分委托 domain.gradeChoice 纯函数，本组件只管交互与展示。
 */
import { useRef, useState, type KeyboardEvent } from 'react'
import type { ChoiceQuestion } from '../../data/types'
import { gradeChoice, type GradeResult } from '../../domain/grading'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'

export interface QuestionCardProps {
  question: ChoiceQuestion
  /** 提交答案回调：传判分结果，由上层决定发币/积分/任务推进 */
  onSubmit: (result: GradeResult) => void
  /** 是否已作答（用于禁用重复提交） */
  answered?: boolean
}

export function QuestionCard({ question, onSubmit, answered = false }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<GradeResult | null>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % question.options.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + question.options.length) % question.options.length
    else return
    event.preventDefault()
    setSelected(question.options[next].key)
    refs.current[next]?.focus()
  }

  const submit = () => {
    if (!selected || result) return
    const graded = gradeChoice(question, selected)
    setResult(graded)
    onSubmit(graded)
  }

  const feedback = result?.feedback

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
          {question.type === 'choice' ? '选择题' : '实操题'}
        </span>
        <span className="text-[11px] text-muted">
          {question.difficulty === 'beginner' ? '入门' : '进阶'}
        </span>
      </div>
      <h2 className="mb-4 text-lg font-semibold leading-snug text-ink">{question.stem}</h2>

      <div role="radiogroup" aria-label="答案选项" className="flex flex-col gap-2.5">
        {question.options.map((option, index) => {
          const isSelected = selected === option.key
          const isCorrect = result?.correct && isSelected
          const isWrong = result && !result.correct && isSelected
          return (
            <button
              key={option.key}
              ref={(el) => {
                refs.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
              disabled={answered || !!result}
              onClick={() => setSelected(option.key)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                'flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                'disabled:cursor-default',
                isCorrect
                  ? 'border-success bg-success/10 text-ink'
                  : isWrong
                    ? 'border-error bg-error/10 text-ink'
                    : isSelected
                      ? 'border-accent bg-accent-soft text-ink'
                      : 'border-line hover:border-accent/50 hover:bg-accent-soft/50 text-ink',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
                  isCorrect ? 'bg-success text-accent-ink' : isWrong ? 'bg-error text-accent-ink' : 'bg-accent-soft text-accent',
                ].join(' ')}
              >
                {option.key}
              </span>
              <span className="leading-relaxed">{option.text}</span>
              {isCorrect && <Icon name="check" size={16} className="ml-auto shrink-0 text-success" />}
            </button>
          )
        })}
      </div>

      {feedback && feedback !== 'invalid' && (
        <p
          className={[
            'mt-4 flex items-center gap-2 text-sm font-medium',
            result?.correct ? 'text-success' : 'text-error',
          ].join(' ')}
          role="status"
        >
          <Icon name={result?.correct ? 'check' : 'alert'} size={16} />
          {result?.correct ? '答对了，金币 +5' : '再想想，看看下面的解析'}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={submit} disabled={!selected || !!result || answered}>
          {result ? '已作答' : '提交答案'}
        </Button>
        {answered && !result && <span className="text-xs text-muted">这道题已经答过啦</span>}
      </div>
    </GlassCard>
  )
}
