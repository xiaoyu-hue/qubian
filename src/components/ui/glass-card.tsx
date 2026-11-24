import type { ComponentPropsWithoutRef } from 'react'

export type GlassTone = 'subtle' | 'default' | 'strong'

export interface GlassCardProps extends ComponentPropsWithoutRef<'div'> {
  /** 玻璃强度：subtle 轻薄 / default 标准 / strong 厚重 */
  tone?: GlassTone
  /** 是否显示顶部高光（用于主要浮层） */
  highlight?: boolean
}

const toneClass: Record<GlassTone, string> = {
  subtle: 'glass--subtle',
  default: '',
  strong: 'glass--strong',
}

/**
 * 玻璃卡片：液态玻璃的基础容器。
 * 视觉参数来自 glass.css，组件只负责类名组合与属性透传。
 */
export function GlassCard({
  tone = 'default',
  highlight = false,
  className = '',
  children,
  ...rest
}: GlassCardProps) {
  const classes = [
    'glass',
    toneClass[tone],
    highlight ? 'glass--highlight' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
