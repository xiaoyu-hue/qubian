/**
 * 实操题卡（PRD F04 一期自评）：写代码 → 对照参考实现 → 自评「懂了/需练习」。
 * 一期用轻量 textarea（零依赖）；二期可替换为 CodeMirror（T1.8），接口不变。
 * 判分委托 domain.gradeCode 纯函数，自评结果由上层发币。
 */
import { useState } from 'react'
import type { PracticeQuestion } from '../../data/types'
import { gradeCode, type GradeResult } from '../../domain/grading'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'

export interface PracticeCardProps {
  question: PracticeQuestion
  onSubmit: (result: GradeResult) => void
  answered?: boolean
}

export function PracticeCard({ question, onSubmit, answered = false }: PracticeCardProps) {
  const [code, setCode] = useState(question.starterCode ?? '')
  const [showReference, setShowReference] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)

  const selfAssess = (passed: boolean) => {
    if (result) return
    const graded = gradeCode(question, passed)
    setResult(graded)
    onSubmit(graded)
  }

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">实操题</span>
        <span className="text-[11px] text-muted">{question.difficulty === 'beginner' ? '入门' : '进阶'}</span>
      </div>
      <h2 className="mb-4 text-lg font-semibold leading-snug text-ink">{question.stem}</h2>

      <label htmlFor="practice-code" className="mb-2 block text-xs font-medium text-muted">
        在这里写代码
      </label>
      <textarea
        id="practice-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={answered || !!result}
        spellCheck={false}
        rows={8}
        className="w-full resize-y rounded-xl border border-line bg-accent-soft/40 p-4 font-mono text-sm leading-relaxed text-ink outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default"
      />

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowReference((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={showReference}
        >
          <Icon name="chevron" size={14} className={showReference ? 'rotate-90' : ''} />
          {showReference ? '收起参考实现' : '查看参考实现'}
        </button>
        {showReference && (
          <pre className="mt-3 overflow-x-auto rounded-xl bg-accent-soft/60 p-4 text-xs leading-relaxed text-ink">
            {question.referenceCode}
          </pre>
        )}
      </div>

      {result ? (
        <p className={`mt-4 flex items-center gap-2 text-sm font-medium ${result.correct ? 'text-success' : 'text-muted'}`} role="status">
          <Icon name={result.correct ? 'check' : 'info'} size={16} />
          {result.correct ? '已标记为掌握，金币 +5' : '已记录，继续练习'}
        </p>
      ) : (
        !answered && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={() => selfAssess(true)} variant="primary">我懂了</Button>
            <Button onClick={() => selfAssess(false)} variant="secondary">还需练习</Button>
            <span className="text-xs text-muted">对照参考实现后自评</span>
          </div>
        )
      )}
      {answered && !result && <p className="mt-4 text-xs text-muted">这道题已经答过啦</p>}
    </GlassCard>
  )
}
