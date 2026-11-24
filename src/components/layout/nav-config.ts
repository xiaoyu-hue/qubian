import type { IconName } from '../ui/icon'

export interface NavItem {
  to: string
  label: string
  icon: IconName
}

/** 主导航四项（D2 决策）：首页/学习/书城/我的；设置入口收进「我的」。 */
export const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/learning', label: '学习', icon: 'study' },
  { to: '/bookstore', label: '书城', icon: 'store' },
  { to: '/profile', label: '我的', icon: 'user' },
]
