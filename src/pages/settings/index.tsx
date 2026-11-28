import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { SegmentedControl } from '../../components/ui/segmented-control'
import { ThemeSwitch } from '../../components/ui/theme-switch'
import { GlassCard } from '../../components/ui/glass-card'
import { Button } from '../../components/ui/button'
import { useSettingsStore } from '../../stores/settingsStore'
import { useProfileStore } from '../../stores/profileStore'
import { useProgressStore } from '../../stores/progressStore'
import { clearAllStored } from '../../data/repositories/storage'
import { checkForUpdate, type UpdateState } from '../../lib/update-check'

/** 每日强度档位（PRD F01：3 / 5 / 10 题，默认 5） */
const INTENSITY_OPTIONS = [
  { value: 3, label: '3 题' },
  { value: 5, label: '5 题' },
  { value: 10, label: '10 题' },
] as const

export default function SettingsPage() {
  const intensity = useSettingsStore((state) => state.settings.taskIntensity)
  const setIntensity = useSettingsStore((state) => state.setTaskIntensity)
  const setOnboardingDone = useSettingsStore((state) => state.setOnboardingDone)
  const resetProfile = useProfileStore((state) => state.resetProfile)
  const resetProgress = useProgressStore((state) => state.resetProgress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' })

  const runUpdateCheck = async () => {
    setUpdateState({ status: 'checking' })
    setUpdateState(await checkForUpdate(__APP_VERSION__))
  }

  const clearData = () => {
    // 先清空仓储，再重置各 Store 的内存态；引导标记一并复位，下次打开重新引导
    clearAllStored()
    resetProfile()
    resetProgress()
    setOnboardingDone(false)
    setConfirmOpen(false)
  }

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">设置</h1>
      <p className="mt-2 text-sm text-muted">主题、每日学习强度、清除数据</p>

      <div className="mt-8 space-y-4">
        <GlassCard
          className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          highlight
        >
          <div>
            <h2 className="text-sm font-semibold text-ink">外观主题</h2>
            <p className="mt-1 text-xs text-muted">跟随系统 / 浅色 / 深色</p>
          </div>
          <ThemeSwitch />
        </GlassCard>

        <GlassCard className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">每日学习强度</h2>
            <p className="mt-1 text-xs text-muted">
              每天目标 {intensity} 题 · 随时可调整
            </p>
          </div>
          <SegmentedControl
            options={INTENSITY_OPTIONS}
            value={intensity}
            onChange={setIntensity}
            ariaLabel="每日学习强度"
          />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold text-ink">检查更新</h2>
              <p className="mt-1 text-xs text-muted">
                当前版本 v{__APP_VERSION__}
                {updateState.status === 'up-to-date' && ` · 已是最新版本`}
                {updateState.status === 'available' && ` · 发现新版本 v${updateState.latest}`}
                {updateState.status === 'error' && ` · ${updateState.message}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {updateState.status === 'available' && (
                <a
                  href={updateState.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-ink transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  前往更新
                </a>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={runUpdateCheck}
                disabled={updateState.status === 'checking'}
              >
                {updateState.status === 'checking' ? '检查中…' : '检查更新'}
              </Button>
            </div>
          </div>
          {updateState.status === 'idle' && (
            <p className="mt-3 text-[11px] text-muted">向 GitHub 查询最新公开发布版本，需要联网。</p>
          )}
          {updateState.status === 'available' && (
            <p className="mt-3 text-[11px] text-muted">
              新版本已发布，点击「前往更新」查看发布说明；线上站点通常已自动部署最新版本。
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold text-ink">清除数据</h2>
              <p className="mt-1 text-xs text-muted">
                清空全部学习记录、金币与进度，且不可恢复
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>清除</Button>
          </div>
        </GlassCard>
      </div>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="glass glass--strong fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-ink">确认清除全部数据？</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted">
              这会清空金币、等级、答题记录和每日任务，且无法恢复。确定要继续吗？
            </Dialog.Description>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>取消</Button>
              <Button variant="danger" className="flex-1" onClick={clearData}>确认清除</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
