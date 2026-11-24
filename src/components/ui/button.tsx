import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 视觉层级：primary 主操作 / secondary 次操作 / ghost 弱操作 / danger 危险操作 */
  variant?: ButtonVariant
  size?: ButtonSize
  /** 加载态：显示转圈并禁用交互 */
  loading?: boolean
  /** 前置图标位 */
  leading?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'bg-accent-soft text-accent hover:bg-accent/20',
  ghost: 'text-muted hover:bg-accent-soft hover:text-ink',
  danger: 'bg-error text-accent-ink hover:opacity-90',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

/**
 * 统一按钮：集中处理焦点、禁用、按下、加载四态，避免各页面重复写类名。
 * 焦点框对键盘可见、对鼠标点击不显示（focus-visible）。
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leading,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-[background-color,transform,opacity] duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100',
        variantClass[variant],
        sizeClass[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leading
      )}
      {children}
    </button>
  )
}
