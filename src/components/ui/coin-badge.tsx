import { Icon } from './icon'

interface CoinBadgeProps {
  /** 金币数量；真实数据接入前显示占位值 */
  value?: number
}

/**
 * 金币徽标（D3 克制点缀）：小尺寸、金色仅用于金币。
 * 阶段 0.5 为视觉占位，数值来源将在 T1.10 经济层接入。
 */
export function CoinBadge({ value = 0 }: CoinBadgeProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-accent-soft px-2.5 py-1.5"
      aria-label={`金币 ${value}`}
    >
      <Icon name="coin" size={16} className="text-coin" />
      <span className="text-xs font-semibold text-ink">{value}</span>
    </div>
  )
}
