import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import HomePage from '../pages/home'
import LearningPage from '../pages/learning'
import BookstorePage from '../pages/bookstore'
import ProfilePage from '../pages/profile'
import SettingsPage from '../pages/settings'

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
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
