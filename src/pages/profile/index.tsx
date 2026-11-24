import { Link } from 'react-router-dom'
import { PagePlaceholder } from '../../components/ui/page-placeholder'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'

export default function ProfilePage() {
  return (
    <section>
      <PagePlaceholder
        title="我的"
        description="等级、积分、成就墙与学习统计（PRD F11–F14）"
      />

      <Link
        to="/settings"
        className="mt-4 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <GlassCard className="flex items-center gap-3 p-4">
          <Icon name="settings" size={20} className="text-accent" />
          <span className="flex-1 text-sm font-medium text-ink">设置</span>
          <Icon name="chevron" size={18} className="text-muted" />
        </GlassCard>
      </Link>
    </section>
  )
}
