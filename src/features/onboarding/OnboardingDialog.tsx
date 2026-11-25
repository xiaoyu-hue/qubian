/**
 * 首次引导（PRD F01）：选语言 → 设每日强度 → 完成。
 * - 用 Radix Dialog 承载，不可关闭（必须完成才能进入）；
 * - 语言当前仅 Python 可用，其他标注「二期」禁用；
 * - 完成后写 settingsStore.onboardingDone，刷新不再出现。
 */
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../../components/ui/button'
import { SegmentedControl } from '../../components/ui/segmented-control'
import { useSettingsStore } from '../../stores/settingsStore'

const INTENSITY_OPTIONS = [
  { value: 3, label: '轻松 · 3题' },
  { value: 5, label: '标准 · 5题' },
  { value: 8, label: '进阶 · 8题' },
] as const

export function OnboardingDialog() {
  const onboardingDone = useSettingsStore((s) => s.settings.onboardingDone)
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone)
  const setTaskIntensity = useSettingsStore((s) => s.setTaskIntensity)
  const currentIntensity = useSettingsStore((s) => s.settings.taskIntensity)
  const [intensity, setIntensity] = useState(currentIntensity)

  const finish = () => {
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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed="true"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
              >
                Python
              </button>
              <button
                type="button"
                disabled
                title="二期开放"
                className="cursor-not-allowed rounded-lg bg-accent-soft px-4 py-2 text-sm text-muted opacity-60"
              >
                JavaScript（二期）
              </button>
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
