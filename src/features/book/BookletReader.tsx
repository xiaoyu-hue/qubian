/**
 * 小册子阅读器（PRD F09 / T1.16）：金币购买解锁 + 内嵌阅读 + 读完返币。
 * - 未购买：显示封面、价格、购买按钮；余额不足提示差额。
 * - 已购买：按分节展示题目正文与双答案（专业/大白话切换），底部「标记读完」。
 * - 读完返币走 profileStore.markBookRead，幂等防重复领取。
 * - 购买确认用 Radix Dialog（T0.11），视觉沿用玻璃基线。
 */
import { useState } from 'react'
import type { BookletContent } from '../../data/types'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { Icon } from '../../components/ui/icon'
import { Dialog, DialogContent, DialogTrigger } from '../../components/ui/dialog'
import { useToast } from '../../components/ui/toast'
import { useProfileStore } from '../../stores/profileStore'

type AnswerMode = 'plain' | 'professional'

interface BookletReaderProps {
  content: BookletContent
}

export function BookletReader({ content }: BookletReaderProps) {
  const { booklet, sections, entryCount } = content
  const [mode, setMode] = useState<AnswerMode>('plain')
  const [dialogOpen, setDialogOpen] = useState(false)

  const coins = useProfileStore((s) => s.profile.coins)
  const purchased = useProfileStore((s) => s.profile.purchasedBookIds.includes(booklet.id))
  const read = useProfileStore((s) => s.profile.readBookIds.includes(booklet.id))
  const purchaseBook = useProfileStore((s) => s.purchaseBook)
  const markBookRead = useProfileStore((s) => s.markBookRead)
  const { show } = useToast()

  const shortage = Math.max(0, booklet.price - coins)

  function handlePurchase() {
    const ok = purchaseBook(booklet.id, booklet.price)
    setDialogOpen(false)
    if (ok) show(`已解锁「${booklet.title}」，可以开始阅读`, 'success')
    else show(`金币不足，还差 ${shortage} 枚`, 'error')
  }

  function handleRead() {
    const rewarded = markBookRead(booklet.id)
    if (rewarded) show('已读完，返还金币已到账', 'success')
  }

  return (
    <GlassCard className="overflow-hidden" highlight>
      {/* 封面区 */}
      <div className="border-b border-accent-soft/60 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-ink">
            {booklet.badge}
          </span>
          <span className="text-[11px] text-muted">{entryCount} 道精讲 · 双答案</span>
          {purchased && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-success">
              <Icon name="check" size={14} /> 已解锁
            </span>
          )}
        </div>
        <h2 className="text-lg font-bold text-ink">{booklet.title}</h2>
        <p className="mt-1 text-sm text-accent">{booklet.subtitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{booklet.description}</p>
      </div>

      {/* 未购买：购买入口 */}
      {!purchased && (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft" aria-hidden="true">
            <Icon name="study" size={22} className="text-accent" />
          </div>
          <p className="text-sm text-muted">购买后永久可读，读完返还金币</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button leading={<Icon name="coin" size={16} />}>
                {booklet.price} 金币解锁
              </Button>
            </DialogTrigger>
            <DialogContent title="确认购买" description={`用 ${booklet.price} 金币解锁「${booklet.title}」？`}>
              <p className="text-sm text-muted">
                当前金币 <span className="font-semibold text-ink">{coins}</span>
                {shortage > 0 ? (
                  <span className="ml-1 text-error">（还差 {shortage} 枚，去做题赚金币吧）</span>
                ) : null}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                  再想想
                </Button>
                <Button size="sm" loading={false} disabled={shortage > 0} onClick={handlePurchase}>
                  确认解锁
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {shortage > 0 && (
            <p className="text-xs text-muted">还差 {shortage} 枚金币 · <a href="#/learning" className="text-accent underline-offset-2 hover:underline">去学习</a></p>
          )}
        </div>
      )}

      {/* 已购买：正文阅读 */}
      {purchased && (
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">全书共 {entryCount} 条 · 双答案对照</p>
            <div
              role="tablist"
              aria-label="答案版本"
              className="inline-flex gap-0.5 rounded-lg bg-accent-soft p-0.5"
            >
              {(['plain', 'professional'] as AnswerMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    mode === m ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink',
                  ].join(' ')}
                >
                  {m === 'plain' ? '大白话' : '专业版'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="h-4 w-1 rounded-full bg-accent" aria-hidden="true" />
                  {section.title}
                </h3>
                <ol className="flex flex-col gap-4">
                  {section.entries.map((entry, index) => (
                    <li key={entry.id} className="rounded-xl bg-accent-soft/40 p-4">
                      <p className="text-sm font-medium text-ink">
                        <span className="mr-2 text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>
                        {entry.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">{entry.stem}</p>
                      <div className="mt-3 border-t border-accent-soft/60 pt-3">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-accent">
                          {mode === 'plain' ? '大白话版' : '专业版'}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                          {mode === 'plain' ? entry.answer.plain : entry.answer.professional}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          {/* 读完返币 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-accent-soft/60 pt-5">
            <p className="text-xs text-muted">读完了？留个标记，返还你的金币</p>
            {read ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <Icon name="check" size={15} /> 已领取返币
              </span>
            ) : (
              <Button size="sm" variant="secondary" leading={<Icon name="coin" size={15} />} onClick={handleRead}>
                标记读完 · 返金币
              </Button>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
