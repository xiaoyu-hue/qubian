import type { ReactNode, SVGProps } from 'react'

/** 导航与状态类图标。零依赖内联 SVG，线性风格，继承 currentColor。 */
export type IconName =
  | 'home'
  | 'study'
  | 'store'
  | 'user'
  | 'settings'
  | 'coin'
  | 'chevron'
  | 'alert'
  | 'info'
  | 'check'
  | 'close'
  | 'compass'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

const iconPaths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  study: (
    <>
      <path d="M12 6.5c-2 -1.4 -4.5 -2 -8 -2v13c3.5 0 6 .6 8 2 2 -1.4 4.5 -2 8 -2v-13c-3.5 0 -6 .6 -8 2Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  store: (
    <>
      <path d="M4.5 8h15l-1.3 12H5.8L4.5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20.5c0 -3.6 3.1 -6 7 -6s7 2.4 7 6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.6 4.6 6 6M18 18l1.4 1.4M3 12h2M19 12h2M4.6 19.4 6 18M18 6l1.4 -1.4" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 8 3 4 3-4M12 12v5M9.5 13.5h5M9.5 16h5" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  alert: (
    <>
      <path d="M12 4 2.8 20h18.4L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
}

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {iconPaths[name]}
    </svg>
  )
}
