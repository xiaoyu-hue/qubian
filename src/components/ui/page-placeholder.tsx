import { GlassCard } from './glass-card'

interface PagePlaceholderProps {
  title: string
  description: string
}

/** 阶段 0 页面占位：统一风格的空页骨架，后续由真实功能替换。 */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <GlassCard className="mt-8 p-8" highlight>
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <div className="mb-3 h-10 w-10 rounded-xl bg-accent-soft" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">页面建设中</p>
          <p className="mt-1 text-xs text-muted">该页面将在对应开发阶段填入真实功能</p>
        </div>
      </GlassCard>
    </section>
  )
}
