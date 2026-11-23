import { AppShell } from '../components/layout/AppShell'
import { AuthPage } from '../features/auth/AuthPage'

export type AppRoute = 'loading' | 'error' | 'login' | 'chat'

export function resolveAppRoute(
  isLoading: boolean,
  hasError: boolean,
  isAuthenticated: boolean,
): AppRoute {
  if (isLoading) {
    return 'loading'
  }

  if (hasError) {
    return 'error'
  }

  return isAuthenticated ? 'chat' : 'login'
}

interface AppRoutesProps {
  route: AppRoute
  userName?: string | undefined
  userEmail?: string | undefined
  apiIdentity: string | null
  apiCheckFailed: boolean
  onRetry: () => void
  onLogin: (email: string) => void
  onGoogleLogin: () => void
  onForgotPassword: (email: string) => void
  onCreateAccount: () => void
  onLogout: () => void
}

export function AppRoutes({
  route,
  userName,
  userEmail,
  apiIdentity,
  apiCheckFailed,
  onRetry,
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onCreateAccount,
  onLogout,
}: AppRoutesProps) {
  if (route === 'loading') {
    return (
      <main className="auth-page" aria-live="polite">
        <p>Carregando autenticação...</p>
      </main>
    )
  }

  if (route === 'error') {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="auth-title">
          <h1 id="auth-title">Não foi possível autenticar</h1>
          <p role="alert">O serviço de autenticação não concluiu a solicitação. Tente novamente.</p>
          <button type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        </section>
      </main>
    )
  }

  if (route === 'chat') {
    return (
      <AppShell
        accountName={userName || userEmail || 'Conta Nexo'}
        apiIdentity={apiIdentity}
        apiCheckFailed={apiCheckFailed}
        onLogout={onLogout}
      />
    )
  }

  return (
    <AuthPage
      onLogin={onLogin}
      onGoogleLogin={onGoogleLogin}
      onForgotPassword={onForgotPassword}
      onCreateAccount={onCreateAccount}
    />
  )
}
