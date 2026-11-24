import type { ReactNode } from 'react'
import { Icon, type IconName } from './icon'

export interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  /** 操作区，通常放一个 Button */
  action?: ReactNode
  className?: string
}

/** 空状态：无内容时的引导位。图标克制、文案说明原因并给出下一步。 */
export function EmptyState({
  icon = 'study',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon name={icon} size={26} />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
