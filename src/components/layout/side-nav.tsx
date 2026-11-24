import { NavLink } from 'react-router-dom'
import { navItems } from './nav-config'
import { Icon } from '../ui/icon'
import { useTheme } from '../../app/providers'
import type { ThemeMode } from '../../app/providers'

const themeOptions: { value: ThemeMode; label: string; short: string }[] = [
  { value: 'system', label: '跟随系统', short: '跟' },
  { value: 'light', label: '浅色', short: '浅' },
  { value: 'dark', label: '深色', short: '深' },
]

/**
 * 侧栏：平板为窄图标轨道（sm–lg），桌面为展开侧栏（lg+）。
 * 桌面底部含主题切换（承接 D2 从顶栏移入的主题入口）。
 */
export function SideNav() {
  const { theme, setTheme } = useTheme()

  return (
    <aside
      aria-label="侧边导航"
      className="glass glass--subtle fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col rounded-none border-y-0 border-l-0 px-2 py-4 sm:flex lg:w-60 lg:px-3"
    >
      <div className="mb-6 flex items-center justify-center lg:justify-start lg:px-2">
        <span className="text-base font-bold tracking-tight">趣编</span>
        <span className="ml-2 hidden text-[10px] uppercase tracking-widest text-muted lg:inline">
          QuBian
        </span>
      </div>

      <nav aria-label="主导航" className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.label}
            className={({ isActive }) =>
              [
                'flex h-12 items-center justify-center gap-3 rounded-xl lg:justify-start lg:px-3',
                'text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive
                  ? 'bg-accent text-accent-ink font-medium'
                  : 'text-muted hover:bg-accent-soft hover:text-ink',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={22} strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="hidden lg:inline">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-[var(--glass-border)] pt-4">
        <p className="mb-2 hidden text-[10px] uppercase tracking-wider text-muted lg:block">
          外观
        </p>
        <div
          className="flex flex-col items-center gap-1.5 lg:flex-row lg:gap-1"
          role="group"
          aria-label="主题模式"
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
              className={[
                'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors lg:h-8 lg:flex-1',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                theme === option.value
                  ? 'bg-accent text-accent-ink'
                  : 'text-muted hover:bg-accent-soft hover:text-ink',
              ].join(' ')}
            >
              <span className="lg:hidden">{option.short}</span>
              <span className="hidden lg:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
