/**
 * 外部书籍导航卡片（PRD F09）。
 * 只放书名/作者/简介/许可徽章，点击跳原站；不复制正文、不需要金币。
 * 版权分级：amber（CC BY-SA / CC BY-NC-SA）只做导航，避免 SA 条款绑定产品许可。
 */
import type { ExternalBook } from '../../data/types'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'

interface ExternalBookCardProps {
  book: ExternalBook
}

const tierLabel: Record<ExternalBook['tier'], string> = {
  green: '可内嵌',
  amber: '仅导航',
}

export function ExternalBookCard({ book }: ExternalBookCardProps) {
  return (
    <GlassCard tone="subtle" className="flex h-full flex-col p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-ink">{book.title}</h3>
        <span
          className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent"
          title="版权分级：仅导航不复制正文"
        >
          {tierLabel[book.tier]}
        </span>
      </div>
      <p className="text-xs text-muted">{book.author}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">{book.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={book.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-accent-soft px-2 py-1 text-[11px] text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          许可 {book.license}
        </a>
        <a
          href={book.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          前往原站 <Icon name="chevron" size={14} />
        </a>
      </div>
    </GlassCard>
  )
}
