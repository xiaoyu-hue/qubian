import { ThemeProvider } from './providers'
import { AppRouter } from './router'
import { ToastProvider } from '../components/ui/toast'
import { OnboardingDialog } from '../features/onboarding/OnboardingDialog'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
        <OnboardingDialog />
      </ToastProvider>
    </ThemeProvider>
  )
}
