import { SegmentedControl } from '../../components/ui/segmented-control'
import { ThemeSwitch } from '../../components/ui/theme-switch'
import { GlassCard } from '../../components/ui/glass-card'
import { useSettingsStore } from '../../stores/settingsStore'

/** 每日强度档位（PRD F01：3 / 5 / 10 题，默认 5） */
const INTENSITY_OPTIONS = [
  { value: 3, label: '3 题' },
  { value: 5, label: '5 题' },
  { value: 10, label: '10 题' },
] as const

export default function SettingsPage() {
  const intensity = useSettingsStore((state) => state.settings.taskIntensity)
  const setIntensity = useSettingsStore((state) => state.setTaskIntensity)

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">设置</h1>
      <p className="mt-2 text-sm text-muted">主题、每日学习强度、清除数据</p>

      <div className="mt-8 space-y-4">
        <GlassCard
          className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          highlight
        >
          <div>
            <h2 className="text-sm font-semibold text-ink">外观主题</h2>
            <p className="mt-1 text-xs text-muted">跟随系统 / 浅色 / 深色</p>
          </div>
          <ThemeSwitch />
        </GlassCard>

        <GlassCard className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">每日学习强度</h2>
            <p className="mt-1 text-xs text-muted">
              每天目标 {intensity} 题 · 随时可调整
            </p>
          </div>
          <SegmentedControl
            options={INTENSITY_OPTIONS}
            value={intensity}
            onChange={setIntensity}
            ariaLabel="每日学习强度"
          />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">清除数据</h2>
              <p className="mt-1 text-xs text-muted">
                清空全部学习记录 · 将在后续任务开放（含二次确认）
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-accent-soft px-2 py-1 text-xs text-muted">
              二期开放
            </span>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
