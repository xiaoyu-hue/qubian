/**
 * 我的（PRD F11/F13，T2.6/T2.7）：等级积分、连续天数、成就墙、错题统计与设置入口。
 * 数据来自 profileStore / progressStore，不自行保存状态。
 */
import { Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'
import { CoinBadge } from '../../components/ui/coin-badge'
import { useProfileStore } from '../../stores/profileStore'
import { useProgressStore, localDate } from '../../stores/progressStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { ACHIEVEMENTS, LEVEL_THRESHOLDS } from '../../data/config/progression'

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  const ensureToday = useProgressStore((s) => s.ensureToday)
  const streak = useProgressStore((s) => s.streak)
  const intensity = useSettingsStore((s) => s.settings.taskIntensity)

  // 确保今日任务存在，展示连续天数时口径与任务一致
  ensureToday(intensity, localDate())

  const nextThreshold = LEVEL_THRESHOLDS[profile.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const levelProgress = nextThreshold > profile.points
    ? Math.round((profile.points / nextThreshold) * 100)
    : 100
  const unlockedIds = new Set(profile.unlockedAchievements.map((a) => a.id))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted">Profile</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">我的</h1>
        <p className="mt-1 text-sm text-muted">成长看得见，每一步都算数。</p>
      </div>

      {/* 核心数据 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">等级</p>
          <p className="mt-1 text-xl font-bold text-accent">Lv.{profile.level}</p>
        </GlassCard>
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">积分</p>
          <p className="mt-1 text-xl font-bold text-ink">{profile.points}</p>
        </GlassCard>
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">连续天数</p>
          <p className="mt-1 text-xl font-bold text-ink">{streak}<span className="text-sm font-normal text-muted"> 天</span></p>
        </GlassCard>
        <GlassCard tone="subtle" className="p-4">
          <p className="text-xs text-muted">金币</p>
          <div className="mt-1"><CoinBadge value={profile.coins} /></div>
        </GlassCard>
      </div>

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

      {/* 成就墙 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="check" size={17} className="text-accent" />
            成就墙
          </h2>
          <span className="text-xs text-muted">{unlockedIds.size} / {ACHIEVEMENTS.length} 已解锁</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.has(a.id)
            const record = profile.unlockedAchievements.find((item) => item.id === a.id)
            return (
              <GlassCard
                key={a.id}
                tone="subtle"
                className={`flex items-start gap-3 p-4 ${unlocked ? '' : 'opacity-60'}`}
              >
                <span className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  unlocked ? 'bg-success text-accent-ink' : 'bg-accent-soft text-muted',
                ].join(' ')}>
                  <Icon name={unlocked ? 'check' : 'info'} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{a.description}</p>
                  {unlocked && record?.unlockedAt && (
                    <p className="mt-1 text-[11px] text-success">
                      {new Date(record.unlockedAt).toLocaleDateString('zh-CN')} 解锁 · 金币 +15
                    </p>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>
      </section>

      {/* 错题统计 + 设置入口 */}
      <div className="flex flex-col gap-3">
        <Link
          to="/learning"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
        >
          <GlassCard className="flex items-center gap-3 p-4">
            <Icon name="study" size={20} className="text-accent" />
            <span className="flex-1 text-sm font-medium text-ink">错题复习</span>
            <span className="text-xs text-muted">{profile.wrongIds.length} 题待复习</span>
            <Icon name="chevron" size={18} className="text-muted" />
          </GlassCard>
        </Link>
        <Link
          to="/settings"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
        >
          <GlassCard className="flex items-center gap-3 p-4">
            <Icon name="settings" size={20} className="text-accent" />
            <span className="flex-1 text-sm font-medium text-ink">设置</span>
            <Icon name="chevron" size={18} className="text-muted" />
          </GlassCard>
        </Link>
      </div>
    </div>
  )
}
