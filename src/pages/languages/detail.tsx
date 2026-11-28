/**
 * 编程语言详情页（T2.11）：五板块双版本介绍，一个开关全局切换大白话/专业版。
 * 本站已开设课程的语言提供「开始学习」入口（先切换当前语言再跳转）。
 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'
import { SegmentedControl } from '../../components/ui/segmented-control'
import { getLanguageById, SECTION_ORDER, SECTION_TITLES } from '../../data/languages'
import { useSettingsStore } from '../../stores/settingsStore'

type ViewMode = 'plain' | 'professional'

const MODE_OPTIONS = [
  { value: 'plain', label: '大白话' },
  { value: 'professional', label: '专业版' },
] as const

export default function LanguageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const [mode, setMode] = useState<ViewMode>('plain')

  const language = id ? getLanguageById(id) : undefined

  if (!language) {
    return (
      <div className="flex flex-col gap-6">
        <GlassCard tone="subtle" className="p-8 text-center">
          <Icon name="alert" size={28} className="mx-auto text-muted" />
          <h1 className="mt-3 text-lg font-bold text-ink">没有找到这门语言</h1>
          <p className="mt-2 text-sm text-muted">它可能还没收录进百科。</p>
          <Link
            to="/languages"
            className="mt-5 inline-block rounded-lg text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            返回语言百科
          </Link>
        </GlassCard>
      </div>
    )
  }

  const handleStartLearning = () => {
    setLanguage(language.id)
    navigate('/learning')
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/languages"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg text-sm text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Icon name="chevron" size={14} className="rotate-180" />
        语言百科
      </Link>

      {/* 语言头部 */}
      <GlassCard highlight className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded-full ring-4 ring-accent-soft"
            style={{ backgroundColor: language.color }}
          />
          <h1 className="text-3xl font-bold tracking-tight text-ink">{language.name}</h1>
          {language.learnable && (
            <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-ink">
              本站可学
            </span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-accent">{language.alias}</p>
        <p className="mt-3 text-base leading-relaxed text-ink/90">{language.tagline}</p>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <span className="text-muted">诞生 <span className="font-semibold text-ink">{language.born} 年</span></span>
          <span className="text-muted">设计者 <span className="font-semibold text-ink">{language.creator}</span></span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {language.keywords.map((kw) => (
            <span key={kw} className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] text-muted">
              {kw}
            </span>
          ))}
        </div>

        {language.learnable && (
          <div className="mt-6">
            <Button onClick={handleStartLearning} leading={<Icon name="study" size={16} />}>
              开始学 {language.name}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* 全局版本切换：一个开关控制全部板块 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">完整介绍</h2>
          <p className="mt-0.5 text-xs text-muted">同一内容，两种说法，随时切换对照。</p>
        </div>
        <SegmentedControl
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          ariaLabel="介绍版本切换"
        />
      </div>

      {/* 五个板块 */}
      <div className="flex flex-col gap-4">
        {SECTION_ORDER.map((key, index) => {
          const section = language.sections.find((s) => s.key === key)
          if (!section) return null
          return (
            <GlassCard key={key} tone="subtle" className="p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-[11px] font-semibold text-accent">
                  {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-ink">{SECTION_TITLES[key]}</h3>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-ink/85">
                {mode === 'plain' ? section.content.plain : section.content.professional}
              </p>
            </GlassCard>
          )
        })}
      </div>

      <p className="text-xs leading-relaxed text-muted">
        发展史中的年份与人物已交叉核实；语言特性随版本演进，介绍以主线版本为准。
      </p>
    </div>
  )
}
