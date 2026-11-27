/**
 * 首页（PRD F01/F13）：今日任务进度、继续学习入口、金币与等级概览。
 * 数据来自 profileStore / progressStore / settingsStore，不自行保存状态。
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'
import { CoinBadge } from '../../components/ui/coin-badge'
import { useProfileStore } from '../../stores/profileStore'
import { useProgressStore, localDate } from '../../stores/progressStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { loadQuestions } from '../../data/questions/python/index'
import { LEVEL_THRESHOLDS } from '../../data/config/progression'

export default function HomePage() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const intensity = useSettingsStore((s) => s.settings.taskIntensity)
  const ensureToday = useProgressStore((s) => s.ensureToday)
  const streak = useProgressStore((s) => s.streak)
  const task = useMemo(() => ensureToday(intensity, localDate()), [ensureToday, intensity])

  const total = loadQuestions().length
  const answered = profile.answeredIds.length
  const nextThreshold = LEVEL_THRESHOLDS[profile.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const levelProgress = nextThreshold > profile.points
    ? Math.round((profile.points / nextThreshold) * 100)
    : 100

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted">Home</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">欢迎回来</h1>
        <p className="mt-1 text-sm text-muted">今天也学一点，积少成多。</p>
      </div>

      {/* 关键数据概览 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">金币</p>
          <div className="mt-1"><CoinBadge value={profile.coins} /></div>
        </GlassCard>
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">等级</p>
          <p className="mt-1 text-xl font-bold text-accent">Lv.{profile.level}</p>
        </GlassCard>
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">连续天数</p>
          <p className="mt-1 text-xl font-bold text-ink">{streak}<span className="text-sm font-normal text-muted"> 天</span></p>
        </GlassCard>
        <GlassCard tone="subtle" className="col-span-2 p-4 sm:col-span-1">
          <p className="text-xs text-muted">已掌握题目</p>
          <p className="mt-1 text-xl font-bold text-ink">{answered}<span className="text-sm font-normal text-muted"> / {total}</span></p>
        </GlassCard>
      </div>

      {/* 今日任务 */}
      <GlassCard className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="compass" size={17} className="text-accent" />
            今日任务
          </h2>
          <span className="text-xs text-muted">{task.completed} / {task.target} 题</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-accent-soft" role="progressbar" aria-valuenow={task.completed} aria-valuemin={0} aria-valuemax={task.target}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(task.completed / task.target) * 100}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted">
          {task.completed >= task.target ? '今日目标已完成，做得好！' : `再做 ${task.target - task.completed} 题即可达标`}
        </p>
      </GlassCard>

      {/* 等级进度 */}
      <GlassCard tone="subtle" className="p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">升到 Lv.{profile.level + 1}</span>
          <span className="text-muted">{profile.points} / {nextThreshold} 积分</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-accent-soft" role="progressbar" aria-valuenow={levelProgress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${levelProgress}%` }} />
        </div>
      </GlassCard>

      <Button size="lg" onClick={() => navigate('/learning')} leading={<Icon name="study" size={18} />}>
        继续学习
      </Button>
    </div>
  )
}
