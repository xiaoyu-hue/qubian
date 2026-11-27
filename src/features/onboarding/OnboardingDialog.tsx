/**
 * 首次引导（PRD F01）：选语言 → 设每日强度 → 完成。
 * - 用 Radix Dialog 承载，不可关闭（必须完成才能进入）；
 * - 语言列表来自执行层 LANGUAGES，选择后写入 settingsStore 持久化；
 * - 完成后写 settingsStore.onboardingDone，刷新不再出现。
 */
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../../components/ui/button'
import { SegmentedControl } from '../../components/ui/segmented-control'
import { useSettingsStore } from '../../stores/settingsStore'
import { LANGUAGES, type ProgrammingLanguage } from '../../lib/runtime'

const INTENSITY_OPTIONS = [
  { value: 3, label: '轻松 · 3题' },
  { value: 5, label: '标准 · 5题' },
  { value: 8, label: '进阶 · 8题' },
] as const

export function OnboardingDialog() {
  const onboardingDone = useSettingsStore((s) => s.settings.onboardingDone)
  const savedLanguage = useSettingsStore((s) => s.settings.language)
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone)
  const setTaskIntensity = useSettingsStore((s) => s.setTaskIntensity)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const currentIntensity = useSettingsStore((s) => s.settings.taskIntensity)
  const [intensity, setIntensity] = useState(currentIntensity)
  const [language, setLanguageLocal] = useState<ProgrammingLanguage>(
    (savedLanguage as ProgrammingLanguage) ?? 'python',
  )

  const finish = () => {
    setLanguage(language)
    setTaskIntensity(intensity)
    setOnboardingDone(true)
  }

  return (
    <Dialog.Root open={!onboardingDone}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="glass glass--strong fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 focus:outline-none"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-xl font-bold text-ink">欢迎来到趣编</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">
            两步设置，开始你的编程学习之旅。
          </Dialog.Description>

          <section className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-ink">1 · 选择学习语言</h3>
            <div role="group" aria-label="学习语言选择" className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const selected = language === lang.value
                return (
                  <button
                    key={lang.value}
                    type="button"
                    aria-pressed={selected}
                    disabled={!lang.available}
                    onClick={() => setLanguageLocal(lang.value)}
                    className={[
                      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      !lang.available
                        ? 'cursor-not-allowed bg-accent-soft text-muted opacity-60'
                        : selected
                          ? 'bg-accent text-accent-ink'
                          : 'bg-accent-soft text-muted hover:text-ink',
                    ].join(' ')}
                  >
                    {lang.label}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-ink">2 · 每日学习目标</h3>
            <p className="mb-3 text-xs text-muted">每天做几道题？随时可以在「我的 → 设置」里改。</p>
            <SegmentedControl
              options={INTENSITY_OPTIONS}
              value={intensity}
              onChange={setIntensity}
              ariaLabel="每日学习目标强度"
            />
          </section>

          <Button className="mt-7 w-full" size="lg" onClick={finish}>
            开始学习
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
