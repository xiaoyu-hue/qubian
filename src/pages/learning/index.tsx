/**
 * 学习页（PRD F02–F04）：选题列表 + 答题闭环。
 * 列表：章节进度 + 难度分区 + 题型筛选（专业学习平台通行结构）；
 * 答题：选择题判分 → 双答案解锁（可主动求助）→ 发金币/积分 → 推进每日任务。
 */
import { useMemo, useState } from 'react'
import type { Difficulty, Question, QuestionType } from '../../data/types'
import { getQuestionById, listChapters, loadQuestions } from '../../data/questions/python/index'
import { useProfileStore } from '../../stores/profileStore'
import { useProgressStore } from '../../stores/progressStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useToast } from '../../components/ui/toast'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'
import { QuestionCard } from '../../features/question/QuestionCard'
import { AnswerPanel } from '../../features/question/AnswerPanel'

type Filter = 'all' | QuestionType
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'choice', label: '选择题' },
  { value: 'practice', label: '实操题' },
]

const DIFFICULTY_LABEL: Record<Difficulty, string> = { beginner: '入门', advanced: '进阶' }

export default function LearningPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [helpUsed, setHelpUsed] = useState(false)
  const toast = useToast()

  const profile = useProfileStore((s) => s.profile)
  const awardCorrect = useProfileStore((s) => s.awardCorrect)
  const markAnswered = useProfileStore((s) => s.markAnswered)
  const advanceTask = useProgressStore((s) => s.advanceTask)
  const intensity = useSettingsStore((s) => s.settings.taskIntensity)

  const allQuestions = useMemo(() => loadQuestions(), [])
  const chapters = useMemo(() => listChapters(), [])
  const visible = useMemo(
    () => loadQuestions(filter === 'all' ? {} : { type: filter }),
    [filter],
  )
  const active = activeId ? getQuestionById(activeId) : undefined

  const handleSubmit = (correct: boolean) => {
    advanceTask(intensity)
    if (correct) {
      awardCorrect(activeId!)
      toast.show('答对了！金币 +5、积分 +10', 'success')
    } else {
      markAnswered(activeId!)
    }
  }

  // 答题详情视图
  if (active) {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => { setActiveId(null); setHelpUsed(false) }}
          className="flex items-center gap-1.5 self-start text-sm text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon name="chevron" size={14} className="rotate-180" />
          返回题目列表
        </button>

        <div>
          <span className="text-xs uppercase tracking-widest text-muted">{active.chapter} · {DIFFICULTY_LABEL[active.difficulty]}</span>
          <h1 className="mt-1 text-xl font-bold text-ink">{active.title}</h1>
        </div>

        {active.type === 'choice' ? (
          <QuestionCard
            question={active}
            onSubmit={(r) => handleSubmit(r.correct)}
            answered={profile.answeredIds.includes(active.id)}
          />
        ) : (
          <GlassCard className="p-5 sm:p-6">
            <h2 className="mb-3 text-base font-semibold text-ink">{active.stem}</h2>
            <pre className="overflow-x-auto rounded-xl bg-accent-soft/60 p-4 text-xs leading-relaxed text-ink">{active.starterCode}</pre>
            <p className="mt-4 text-sm text-muted">实操题的完整作答将在下一批接入（浏览器内自评）。现在可以先看解析学习。</p>
            <Button className="mt-4" variant="secondary" onClick={() => handleSubmit(false)}>标记学过</Button>
          </GlassCard>
        )}

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="info" size={16} className="text-accent" />
            答案解析
            {helpUsed && <span className="text-xs font-normal text-muted">（主动求助）</span>}
          </h3>
          <AnswerPanel
            answer={active.answer}
            unlocked={profile.answeredIds.includes(active.id) || helpUsed}
            onAskHelp={() => { setHelpUsed(true); markAnswered(active.id) }}
          />
        </section>
      </div>
    )
  }

  // 列表视图
  const groups: { difficulty: Difficulty; items: Question[] }[] = ([
    { difficulty: 'beginner' as const, items: visible.filter((q) => q.difficulty === 'beginner') },
    { difficulty: 'advanced' as const, items: visible.filter((q) => q.difficulty === 'advanced') },
  ] as { difficulty: Difficulty; items: Question[] }[]).filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted">Learning</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">学习</h1>
        <p className="mt-1 text-sm text-muted">掌握 Python 基础 · 已答 {profile.answeredIds.length} / {allQuestions.length} 题</p>
      </div>

      {/* 章节进度概览 */}
      <GlassCard tone="subtle" className="p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">{chapters[0] ?? '暂无章节'}</span>
          <span className="text-muted">{profile.answeredIds.length} / {allQuestions.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-accent-soft" role="progressbar" aria-valuenow={profile.answeredIds.length} aria-valuemin={0} aria-valuemax={allQuestions.length}>
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${allQuestions.length ? (profile.answeredIds.length / allQuestions.length) * 100 : 0}%` }}
          />
        </div>
      </GlassCard>

      {/* 题型筛选 */}
      <div role="group" aria-label="题型筛选" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={[
              'rounded-lg px-3 py-1.5 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              filter === f.value ? 'bg-accent text-accent-ink font-medium' : 'bg-accent-soft text-muted hover:text-ink',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 难度分区 */}
      {groups.length === 0 ? (
        <GlassCard tone="subtle" className="p-8 text-center text-sm text-muted">该题型暂无题目</GlassCard>
      ) : (
        groups.map((group) => (
          <section key={group.difficulty}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <span className={[
                'rounded-md px-2 py-0.5 text-[11px]',
                group.difficulty === 'beginner' ? 'bg-success/15 text-success' : 'bg-accent-soft text-accent',
              ].join(' ')}>
                {DIFFICULTY_LABEL[group.difficulty]}
              </span>
              <span className="text-xs font-normal text-muted">{group.items.length} 题</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((q) => {
                const done = profile.answeredIds.includes(q.id)
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => { setActiveId(q.id); setHelpUsed(false) }}
                    className="flex items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <GlassCard tone="subtle" className="flex w-full items-center gap-3 p-4 hover:bg-accent-soft/60">
                      <span className={[
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
                        done ? 'bg-success text-accent-ink' : 'bg-accent-soft text-accent',
                      ].join(' ')}>
                        {done ? <Icon name="check" size={15} /> : q.type === 'choice' ? '选' : '码'}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{q.title}</span>
                      <Icon name="chevron" size={16} className="shrink-0 text-muted" />
                    </GlassCard>
                  </button>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
