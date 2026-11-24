import { Outlet } from 'react-router-dom'
import { BottomTabs } from './bottom-tabs'
import { SideNav } from './side-nav'
import { CoinBadge } from '../ui/coin-badge'

/**
 * 应用布局外壳（T0.8）：按断点装配三档导航。
 * 手机：底部标签栏；平板/桌面：侧栏。
 * 顶栏收敛为 Logo + 金币/等级，主题入口按 D2 移出顶栏。
 */
export function AppShell() {
  return (
    <div className="min-h-screen">
      <SideNav />

      <div className="sm:pl-[72px] lg:pl-60">
        <header className="glass glass--subtle sticky top-0 z-20 rounded-none border-x-0 border-t-0">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3 sm:px-8">
            <div className="mr-auto flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight">趣编</span>
              <span className="hidden text-[10px] uppercase tracking-widest text-muted sm:inline">
                QuBian
              </span>
            </div>
            <CoinBadge />
            <div className="hidden items-center gap-1 rounded-lg bg-accent-soft px-2.5 py-1.5 sm:flex">
              <span className="text-[10px] text-muted">等级</span>
              <span className="text-xs font-semibold text-accent">Lv.1</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pb-14 sm:pt-12">
          <Outlet />
        </main>
      </div>

      <BottomTabs />
    </div>
  )
}
