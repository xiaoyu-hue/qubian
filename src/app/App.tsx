import { ThemeProvider } from './providers'
import { AppRouter } from './router'

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}
