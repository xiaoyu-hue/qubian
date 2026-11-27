/**
 * 书城页（PRD F09 / T1.18）：两个板块——我的小册子（金币解锁内嵌阅读）、外部书籍导航（免费）。
 * 三端布局复用阶段 0.5 外壳，本页只做装配，不自定义导航。
 */
import { useMemo } from 'react'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'
import { EmptyState } from '../../components/ui/empty-state'
import { BookletReader } from '../../features/book/BookletReader'
import { ExternalBookCard } from '../../features/book/ExternalBookCard'
import { listBooklets, loadBookletContent } from '../../data/booklets/index'
import { EXTERNAL_BOOKS } from '../../data/config/external-books'

export default function BookstorePage() {
  const booklets = useMemo(() => listBooklets(), [])
  const contents = useMemo(() => booklets.map((b) => loadBookletContent(b.id)).filter((c) => c !== undefined), [booklets])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted">Bookstore</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">书城</h1>
        <p className="mt-1 text-sm text-muted">用金币解锁小册子，读完还能返币；外部好书免费直达。</p>
      </div>

      {/* 板块一：我的小册子 */}
      <section aria-labelledby="booklets-heading">
        <h2 id="booklets-heading" className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
          <Icon name="study" size={18} className="text-accent" />
          我的小册子
          <span className="text-xs font-normal text-muted">· 金币解锁</span>
        </h2>
        {contents.length > 0 ? (
          <div className="flex flex-col gap-5">
            {contents.map((content) => (
              <BookletReader key={content!.booklet.id} content={content!} />
            ))}
          </div>
        ) : (
          <GlassCard tone="subtle" className="p-6">
            <EmptyState title="暂无小册子" description="小册子正在整理中，敬请期待。" />
          </GlassCard>
        )}
      </section>

      {/* 板块二：外部书籍导航 */}
      <section aria-labelledby="external-heading">
        <h2 id="external-heading" className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
          <Icon name="store" size={18} className="text-accent" />
          外部书籍导航
          <span className="text-xs font-normal text-muted">· 免费开放</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {EXTERNAL_BOOKS.map((book) => (
            <ExternalBookCard key={book.id} book={book} />
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          外部书籍仅提供导航链接，本站不复制正文；每条均标注作者与许可，点击前往原站阅读。
        </p>
      </section>
    </div>
  )
}
