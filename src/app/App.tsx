import { ThemeProvider } from './providers'
import { AppRouter } from './router'
import { ToastProvider } from '../components/ui/toast'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  )
}
