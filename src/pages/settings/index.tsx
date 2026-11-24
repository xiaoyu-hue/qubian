import { ThemeSwitch } from '../../components/ui/theme-switch'
import { GlassCard } from '../../components/ui/glass-card'
import { PagePlaceholder } from '../../components/ui/page-placeholder'

export default function SettingsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">设置</h1>
      <p className="mt-2 text-sm text-muted">主题、每日学习强度、清除数据（PRD F11）</p>

      <GlassCard className="mt-8 flex items-center justify-between gap-4 p-5" highlight>
        <div>
          <h2 className="text-sm font-semibold text-ink">外观主题</h2>
          <p className="mt-1 text-xs text-muted">浅色 / 深色 / 跟随系统</p>
        </div>
        <ThemeSwitch />
      </GlassCard>

      <div className="mt-4">
        <PagePlaceholder
          title="更多设置"
          description="每日学习强度、清除数据（T1 阶段实现）"
        />
      </div>
    </section>
  )
}
