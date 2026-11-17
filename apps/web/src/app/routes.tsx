import { AppShell } from '../components/layout/AppShell'

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
  onLogin: () => void
  onGoogleLogin: () => void
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
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-eyebrow">Nexo Chat</p>
        <h1 id="auth-title">Converse com quem importa</h1>
        <p>Entre ou crie sua conta com segurança.</p>
        <div className="auth-actions">
          <button type="button" onClick={onLogin}>
            Continuar com e-mail
          </button>
          <button type="button" className="secondary-button" onClick={onGoogleLogin}>
            Continuar com Google
          </button>
        </div>
      </section>
    </main>
  )
}
