import { NavLink } from 'react-router-dom'
import { navItems } from './nav-config'
import { Icon } from '../ui/icon'

/**
 * 手机底部标签栏（D2：4 项，设置入口收进「我的」）。
 * 仅在小屏显示，固定底部，用 env(safe-area-inset-bottom) 避开系统手势条。
 */
export function BottomTabs() {
  return (
    <nav
      aria-label="主导航"
      className="glass glass--subtle safe-bottom fixed inset-x-0 bottom-0 z-30 rounded-none border-x-0 border-b-0 px-2 sm:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl',
                  'text-[11px] font-medium',
                  isActive ? 'text-accent' : 'text-muted hover:text-ink',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'glass-pill glass-pill--light flex h-8 w-12 items-center justify-center',
                      isActive ? 'glass-pill--active' : '',
                    ].join(' ')}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.75}
                    />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
