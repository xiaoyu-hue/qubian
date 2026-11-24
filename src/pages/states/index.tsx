import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
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
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">组件走查</h1>
        <p className="mt-2 text-sm text-muted">状态系统与复杂交互原语的统一样式走查</p>
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

      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">复杂交互 · Radix 原语</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">打开对话框</Button>
            </DialogTrigger>
            <DialogContent
              title="确认操作"
              description="对话框支持 Esc 关闭、焦点陷阱与读屏语义，视觉沿用玻璃基线。"
            >
              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">取消</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm" onClick={() => toastDemo('success')}>确认</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">打开菜单</Button>
            </DropdownMenuTrigger>
            <DropdownContent align="start">
              <DropdownItem onSelect={() => toastDemo('info')}>编辑</DropdownItem>
              <DropdownItem onSelect={() => toastDemo('success')}>复制链接</DropdownItem>
              <DropdownItem danger onSelect={() => toastDemo('error')}>删除</DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        </div>
        <p className="mt-3 text-xs text-muted">用方向键导航菜单、Esc 关闭；对话框自动聚焦并锁定焦点。</p>
      </GlassCard>
    </section>
  )
}
