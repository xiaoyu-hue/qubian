import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import HomePage from '../pages/home'
import LearningPage from '../pages/learning'
import BookstorePage from '../pages/bookstore'
import ProfilePage from '../pages/profile'
import SettingsPage from '../pages/settings'
import StatesPage from '../pages/states'
import NotFoundPage from '../pages/not-found'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/bookstore" element={<BookstorePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* 状态组件走查页：开发验收入口，不进正式导航 */}
          <Route path="/states" element={<StatesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
