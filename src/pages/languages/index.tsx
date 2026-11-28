/**
 * 编程语言百科列表页（T2.11）：六门主流语言的介绍卡片，点击进详情页。
 * 与书城同属知识板块，但作为独立路由，不占用主导航位。
 */
import { Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'
import { LanguageCard } from '../../features/language/LanguageCard'
import { listLanguages, listLearnableLanguages } from '../../data/languages'

export default function LanguagesPage() {
  const languages = listLanguages()
  const learnable = listLearnableLanguages()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs uppercase tracking-widest text-muted">Languages</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">编程语言百科</h1>
        <p className="mt-1 text-sm text-muted">
          六门值得认识的语言，从是什么、发展史到优缺点，每种说法都有大白话版和专业版。
        </p>
      </div>

      <GlassCard tone="subtle" className="flex items-start gap-3 p-4">
        <Icon name="compass" size={20} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-muted">
          零基础不必纠结选哪门——先看一遍这张地图，心里有数即可。标注「可学习」的
          {learnable.map((l) => l.name).join('、')}在本站有配套课程，可直接开始练习；其余作为视野拓展。
        </p>
      </GlassCard>

      <section aria-labelledby="lang-list-heading">
        <h2 id="lang-list-heading" className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
          <Icon name="study" size={18} className="text-accent" />
          全部语言
          <span className="text-xs font-normal text-muted">· {languages.length} 门</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {languages.map((lang) => (
            <LanguageCard key={lang.id} language={lang} />
          ))}
        </div>
      </section>

      <Link
        to="/bookstore"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg text-sm text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Icon name="chevron" size={14} className="rotate-180" />
        返回书城
      </Link>
    </div>
  )
}
