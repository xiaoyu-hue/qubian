import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { useGlow } from '../../lib/use-glow'

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

/** 胶囊玻璃变体（形态与质感在 glass.css 定义，此处只做类名映射） */
const variantClass: Record<ButtonVariant, string> = {
  primary: 'glass-pill--primary',
  secondary: 'glass-pill--secondary',
  ghost: 'glass-pill--ghost',
  danger: 'glass-pill--danger',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

/**
 * 统一按钮：集中处理焦点、禁用、按下、加载四态，避免各页面重复写类名。
 * 液态玻璃胶囊：高光跟随鼠标、按下弹性回弹；焦点框对键盘可见、对鼠标点击不显示。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leading,
    disabled,
    className = '',
    onMouseMove,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const glow = useGlow<HTMLButtonElement>()
  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    glow(event)
    onMouseMove?.(event)
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onMouseMove={handleMouseMove}
      className={[
        'glass-pill inline-flex items-center justify-center gap-2 font-medium',
        'disabled:cursor-not-allowed disabled:opacity-45',
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
          className="relative z-10 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leading
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
})
