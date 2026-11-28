/**
 * 书城页（PRD F09 / T1.18）：两个板块——我的小册子（金币解锁内嵌阅读）、外部书籍导航（免费）。
 * 三端布局复用阶段 0.5 外壳，本页只做装配，不自定义导航。
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'
import { EmptyState } from '../../components/ui/empty-state'
import { BookletReader } from '../../features/book/BookletReader'
import { ExternalBookCard } from '../../features/book/ExternalBookCard'
import { listBooklets, loadBookletContent } from '../../data/booklets/index'
import { EXTERNAL_BOOK_CATEGORY_LABEL, EXTERNAL_BOOKS } from '../../data/config/external-books'
import type { ExternalBookCategory } from '../../data/types'

type CategoryFilter = 'all' | ExternalBookCategory

export default function BookstorePage() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const booklets = useMemo(() => listBooklets(), [])
  const contents = useMemo(() => booklets.map((b) => loadBookletContent(b.id)).filter((c) => c !== undefined), [booklets])

  // 分类筛选：从数据动态生成标签与计数，新增书籍自动纳入，无需手改筛选条
  const categories = useMemo(
    () => Object.keys(EXTERNAL_BOOK_CATEGORY_LABEL) as ExternalBookCategory[],
    [],
  )
  const visibleBooks = useMemo(
    () => category === 'all' ? EXTERNAL_BOOKS : EXTERNAL_BOOKS.filter((b) => b.category === category),
    [category],
  )
  const countBy = (c: CategoryFilter) =>
    c === 'all' ? EXTERNAL_BOOKS.length : EXTERNAL_BOOKS.filter((b) => b.category === c).length

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted">Bookstore</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">书城</h1>
        <p className="mt-1 text-sm text-muted">用金币解锁小册子，读完还能返币；外部好书免费直达。</p>
      </div>

      {/* 语言百科入口：六门语言的双版本介绍，独立路由 */}
      <Link
        to="/languages"
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="查看编程语言百科"
      >
        <GlassCard className="flex items-center gap-3 p-4 transition-transform duration-150 hover:-translate-y-0.5">
          <Icon name="compass" size={22} className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">不知道学哪门语言？先看编程语言百科</p>
            <p className="mt-0.5 text-xs text-muted">六门语言 · 是什么 / 发展史 / 优缺点，各有大白话版</p>
          </div>
          <Icon name="chevron" size={18} className="shrink-0 text-muted" />
        </GlassCard>
      </Link>

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
        {/* 学习方向筛选 */}
        <div role="group" aria-label="外部书籍分类筛选" className="mb-4 flex flex-wrap gap-2">
          {(['all', ...categories] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={[
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                category === c ? 'bg-accent text-accent-ink font-medium' : 'bg-accent-soft text-muted hover:text-ink',
              ].join(' ')}
            >
              {c === 'all' ? '全部' : EXTERNAL_BOOK_CATEGORY_LABEL[c]}
              <span className="ml-1.5 opacity-70">{countBy(c)}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {visibleBooks.map((book) => (
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
