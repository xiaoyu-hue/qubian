import { HashRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useTheme, type ThemeMode } from './providers'
import HomePage from '../pages/home'
import LearningPage from '../pages/learning'
import BookstorePage from '../pages/bookstore'
import ProfilePage from '../pages/profile'
import SettingsPage from '../pages/settings'

const navItems: { to: string; label: string }[] = [
  { to: '/', label: '首页' },
  { to: '/learning', label: '学习' },
  { to: '/bookstore', label: '书城' },
  { to: '/profile', label: '我的' },
  { to: '/settings', label: '设置' },
]

function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const options: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: '跟随' },
    { value: 'light', label: '浅' },
    { value: 'dark', label: '深' },
  ]

  return (
    <div className="flex gap-0.5 rounded-lg bg-accent-soft p-0.5" role="group" aria-label="主题模式">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={[
            'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            theme === option.value
              ? 'bg-accent text-accent-ink'
              : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-10 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <div className="mr-auto flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight">趣编</span>
            <span className="hidden text-[10px] uppercase tracking-widest text-muted sm:inline">
              QuBian
            </span>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isActive
                      ? 'bg-accent text-accent-ink font-medium'
                      : 'text-muted hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Outlet />
      </main>
    </div>
  )
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/bookstore" element={<BookstorePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
