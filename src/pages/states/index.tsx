import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import { ErrorState } from '../../components/ui/error-state'
import { GlassCard } from '../../components/ui/glass-card'
import { Skeleton, SkeletonCard, SkeletonLines } from '../../components/ui/skeleton'
import { useToast, type ToastTone } from '../../components/ui/toast'

/** 状态系统预览：集中展示按钮四态、骨架屏、空/错态与 Toast，供设计与验收走查。 */
export default function StatesPage() {
  const { show } = useToast()
  const toastDemo = (tone: ToastTone) =>
    show(
      tone === 'error' ? '操作失败，请稍后重试' : tone === 'success' ? '保存成功' : '这是一条提示',
      tone,
    )

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">状态系统</h1>
        <p className="mt-2 text-sm text-muted">按钮、加载、空态、错误态与轻提示的统一样式走查</p>
      </header>

      <GlassCard className="p-6" highlight>
        <h2 className="mb-4 text-sm font-semibold text-ink">按钮 · 层级与交互态</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>主要操作</Button>
          <Button variant="secondary">次要操作</Button>
          <Button variant="ghost">弱操作</Button>
          <Button variant="danger">危险操作</Button>
          <Button loading>加载中</Button>
          <Button disabled>禁用</Button>
        </div>
        <p className="mt-3 text-xs text-muted">用 Tab 键聚焦可见焦点框；禁用态不可点击。</p>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">骨架屏 · 加载态</h2>
        <div className="space-y-4">
          <SkeletonLines lines={3} />
          <div className="flex items-center gap-4">
            <Skeleton circle width={40} height={40} />
            <Skeleton width={120} height={14} />
          </div>
          <SkeletonCard />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-2 text-sm font-semibold text-ink">空状态</h2>
        <EmptyState
          icon="study"
          title="还没有题目"
          description="完成第一关后，你的学习记录会出现在这里。"
          action={<Button size="sm">开始学习</Button>}
        />
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-2 text-sm font-semibold text-ink">错误态</h2>
        <ErrorState
          message="网络连接中断，题目未能加载。"
          onRetry={() => toastDemo('success')}
        />
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Toast · 轻提示</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => toastDemo('info')}>普通提示</Button>
          <Button variant="secondary" size="sm" onClick={() => toastDemo('success')}>成功提示</Button>
          <Button variant="secondary" size="sm" onClick={() => toastDemo('error')}>错误提示</Button>
        </div>
      </GlassCard>
    </section>
  )
}
