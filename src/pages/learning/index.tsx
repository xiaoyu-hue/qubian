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
import { Icon } from '../../components/ui/icon'
import { QuestionCard } from '../../features/question/QuestionCard'
import { PracticeCard } from '../../features/question/PracticeCard'
import { AnswerPanel } from '../../features/question/AnswerPanel'

type Filter = 'all' | QuestionType | 'wrong'
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'choice', label: '选择题' },
  { value: 'practice', label: '实操题' },
  { value: 'wrong', label: '错题本' },
]

const DIFFICULTY_LABEL: Record<Difficulty, string> = { beginner: '入门', advanced: '进阶' }

/** 章节标识 → 中文名；未登记的章节回退为原始标识 */
const CHAPTER_LABEL: Record<string, string> = {
  basics: 'Python 基础',
  'control-flow': '控制流',
}
const chapterLabel = (id: string) => CHAPTER_LABEL[id] ?? id

export default function LearningPage() {
  const [chapter, setChapter] = useState<string>('basics')
  const [filter, setFilter] = useState<Filter>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const toast = useToast()

  const profile = useProfileStore((s) => s.profile)
  const awardCorrect = useProfileStore((s) => s.awardCorrect)
  const syncAchievements = useProfileStore((s) => s.syncAchievements)
  const markWrong = useProfileStore((s) => s.markWrong)
  const revealAnswer = useProfileStore((s) => s.revealAnswer)
  const advanceTask = useProgressStore((s) => s.advanceTask)
  const intensity = useSettingsStore((s) => s.settings.taskIntensity)

  const allQuestions = useMemo(() => loadQuestions(), [])
  const chapters = useMemo(() => listChapters(), [])
  const chapterQuestions = useMemo(() => loadQuestions({ chapter }), [chapter])
  const chapterAnswered = useMemo(
    () => chapterQuestions.filter((q) => profile.answeredIds.includes(q.id)).length,
    [chapterQuestions, profile.answeredIds],
  )
  const visible = useMemo(() => {
    if (filter === 'wrong') {
      // 错题本是全局复习视图，跨所有章节
      return allQuestions.filter((q) => profile.wrongIds.includes(q.id))
    }
    return loadQuestions({ chapter, ...(filter === 'all' ? {} : { type: filter }) })
  }, [allQuestions, chapter, filter, profile.wrongIds])
  const active = activeId ? getQuestionById(activeId) : undefined

  /**
   * 提交答案（PRD F04 + T2.6/T2.8）。
   * - 答对且首次掌握：发金币/积分、记录题号、移出错题队列、推进任务、判定成就
   * - 答对但已掌握过：不重复发奖、不重复计任务（防刷）
   * - 答错：加入错题队列、不发奖、不记掌握、不推进任务，解锁解析供学习
   */
  const handleSubmit = (correct: boolean) => {
    if (!activeId) return
    if (!correct) {
      // 答错要看得到解析才谈得上「再试一次」，否则重试只能盲猜（PRD F04 要求答错即展示解析）
      markWrong(activeId)
      revealAnswer(activeId)
      toast.show('已加入错题本，看看解析再试一次', 'info')
      return
    }
    const alreadyMastered = profile.answeredIds.includes(activeId)
    if (alreadyMastered) {
      toast.show('这题你已经掌握了，换个新题继续吧', 'info')
      return
    }
    awardCorrect(activeId)
    // 先推进任务与连续天数，再取最新统计快照判定成就（避免用上一轮渲染的旧值）
    const updatedTask = advanceTask(intensity)
    const latestStreak = useProgressStore.getState().streak
    const latestAnswered = useProfileStore.getState().profile.answeredIds.length
    const unlocked = syncAchievements({
      answeredCount: latestAnswered,
      dailyTaskDone: updatedTask.completed >= updatedTask.target,
      streak: latestStreak,
    })
    toast.show('答对了！金币 +5、积分 +10', 'success')
    for (const achievement of unlocked) {
      toast.show(`成就解锁：${achievement.title} · 金币 +15`, 'success')
    }
  }

  // 答题详情视图
  if (active) {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setActiveId(null)}
          className="flex items-center gap-1.5 self-start text-sm text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon name="chevron" size={14} className="rotate-180" />
          返回题目列表
        </button>

        <div>
          <span className="text-xs uppercase tracking-widest text-muted">{chapterLabel(active.chapter)} · {DIFFICULTY_LABEL[active.difficulty]}</span>
          <h1 className="mt-1 text-xl font-bold text-ink">{active.title}</h1>
        </div>

        {active.type === 'choice' ? (
          <QuestionCard
            question={active}
            onSubmit={(r) => handleSubmit(r.correct)}
            answered={profile.answeredIds.includes(active.id)}
          />
        ) : (
          <PracticeCard
            question={active}
            onSubmit={(r) => handleSubmit(r.correct)}
            answered={profile.answeredIds.includes(active.id)}
          />
        )}

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="info" size={16} className="text-accent" />
            答案解析
            {profile.revealedIds.includes(active.id) && !profile.answeredIds.includes(active.id) && (
              <span className="text-xs font-normal text-muted">（已看解析，未计入掌握）</span>
            )}
          </h3>
          <AnswerPanel
            answer={active.answer}
            unlocked={
              profile.answeredIds.includes(active.id) || profile.revealedIds.includes(active.id)
            }
            onAskHelp={() => revealAnswer(active.id)}
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

      {/* 章节切换 */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted">章节</p>
        <div role="group" aria-label="章节选择" className="flex flex-wrap gap-2">
          {chapters.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={chapter === c}
              onClick={() => { setChapter(c); setFilter('all') }}
              className={[
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                chapter === c ? 'bg-accent text-accent-ink font-medium' : 'bg-accent-soft text-muted hover:text-ink',
              ].join(' ')}
            >
              {chapterLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {/* 当前章节进度概览 */}
      <GlassCard tone="subtle" className="p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">{chapterLabel(chapter)}</span>
          <span className="text-muted">{chapterAnswered} / {chapterQuestions.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-accent-soft" role="progressbar" aria-valuenow={chapterAnswered} aria-valuemin={0} aria-valuemax={chapterQuestions.length}>
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${chapterQuestions.length ? (chapterAnswered / chapterQuestions.length) * 100 : 0}%` }}
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
            {f.value === 'wrong' && profile.wrongIds.length > 0 && (
              <span className="ml-1.5 rounded-full bg-error px-1.5 py-0.5 text-[10px] text-accent-ink">
                {profile.wrongIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 难度分区 */}
      {groups.length === 0 ? (
        <GlassCard tone="subtle" className="p-8 text-center text-sm text-muted">
          {filter === 'wrong' ? '错题本是空的，答错的题会自动收进这里' : '该题型暂无题目'}
        </GlassCard>
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
                    onClick={() => setActiveId(q.id)}
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
