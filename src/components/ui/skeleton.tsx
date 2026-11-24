import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: string | number
  height?: string | number
  /** 圆形（头像位） */
  circle?: boolean
}

/** 单块骨架占位。纯装饰，对读屏隐藏。 */
export function Skeleton({
  width,
  height,
  circle = false,
  className = '',
  style,
  ...rest
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={['skeleton', circle ? 'rounded-full' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height, ...style }}
      {...rest}
    />
  )
}

export interface SkeletonLinesProps {
  lines?: number
  className?: string
}

/** 多行文字骨架，最后一行略短，模拟真实段落。 */
export function SkeletonLines({ lines = 3, className = '' }: SkeletonLinesProps) {
  return (
    <div className={['flex flex-col gap-2.5', className].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? '62%' : '100%'} />
      ))}
    </div>
  )
}

/** 列表项骨架：圆形头像 + 两行文字，用于题目/书城列表加载态。 */
export function SkeletonCard() {
  return (
    <div className="glass glass--subtle flex items-center gap-4 p-4" aria-hidden="true">
      <Skeleton circle width={44} height={44} />
      <div className="flex-1">
        <SkeletonLines lines={2} />
      </div>
    </div>
  )
}
