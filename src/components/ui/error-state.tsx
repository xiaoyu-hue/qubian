import { Button } from './button'
import { Icon } from './icon'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

/** 错误态：说明出了什么问题，并提供重试出口。role=alert 让读屏立即播报。 */
export function ErrorState({
  title = '出了点问题',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={[
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <Icon name="alert" size={26} />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-6">
          重试
        </Button>
      )}
    </div>
  )
}
