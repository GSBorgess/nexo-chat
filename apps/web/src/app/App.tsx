import { AppRoutes } from './routes'
import { SessionProvider } from './session'

function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  )
}

export default App
