/**
 * 编程语言百科卡片：展示一门语言的定位、关键词与学习状态，点击进详情页。
 * 主题色只用于小面积强调（圆点/关键词），深浅主题下不影响可读性。
 */
import { Link } from 'react-router-dom'
import type { LanguageIntro } from '../../data/types'
import { GlassCard } from '../../components/ui/glass-card'
import { Icon } from '../../components/ui/icon'

export function LanguageCard({ language }: { language: LanguageIntro }) {
  return (
    <Link
      to={`/languages/${language.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`查看 ${language.name} 介绍`}
    >
      <GlassCard className="h-full p-5 transition-transform duration-150 hover:-translate-y-0.5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-accent-soft"
            style={{ backgroundColor: language.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="text-lg font-bold text-ink">{language.name}</h3>
              <span className="text-xs text-muted">{language.alias}</span>
            </div>
            <p className="mt-1 text-xs text-muted">诞生于 {language.born} 年</p>
          </div>
          {language.learnable && (
            <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-ink">
              可学习
            </span>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink/80">{language.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {language.keywords.map((kw) => (
            <span key={kw} className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] text-muted">
              {kw}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-glass-border pt-3">
          <span className="text-xs text-muted">查看完整介绍</span>
          <Icon name="chevron" size={16} className="text-accent" />
        </div>
      </GlassCard>
    </Link>
  )
}
