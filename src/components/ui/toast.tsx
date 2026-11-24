import * as ToastPrimitive from '@radix-ui/react-toast'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon, type IconName } from './icon'

export type ToastTone = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  /** 弹出一条提示，默认 3.2 秒后自动消失 */
  show: (message: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneIcon: Record<ToastTone, IconName> = {
  info: 'info',
  success: 'check',
  error: 'alert',
}

const toneClass: Record<ToastTone, string> = {
  info: 'text-accent',
  success: 'text-success',
  error: 'text-error',
}

const AUTO_DISMISS_MS = 3200

/**
 * Toast 容器：底层用 Radix Toast 原语，获得计时关闭、滑动关闭与读屏播报；
 * 对外仍暴露命令式 show()/dismiss()，页面调用方式与阶段 0.5 一致，无需改动。
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = ++seq.current
      setToasts((prev) => [...prev, { id, message, tone }])
    },
    [],
  )

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastPrimitive.Provider duration={AUTO_DISMISS_MS} swipeDirection="right">
      <ToastContext.Provider value={value}>
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className="glass glass--strong data-[state=closed]:animate-none flex items-center gap-3 px-4 py-3 text-sm shadow-lg"
            onOpenChange={(open) => {
              if (!open) dismiss(t.id)
            }}
          >
            <Icon name={toneIcon[t.tone]} size={18} className={toneClass[t.tone]} />
            <ToastPrimitive.Title className="flex-1 text-ink">
              {t.message}
            </ToastPrimitive.Title>
            <ToastPrimitive.Close
              aria-label="关闭提示"
              className="rounded text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon name="close" size={16} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed inset-x-0 bottom-20 z-[60] flex max-w-[100vw] flex-col gap-2 px-4 outline-none sm:bottom-6" />
      </ToastContext.Provider>
    </ToastPrimitive.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内使用')
  return ctx
}
