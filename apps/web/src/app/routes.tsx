import { AppShell } from '../components/layout/AppShell'
import { AuthPage } from '../features/auth/AuthPage'
import { useSession } from './session'

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

export function AppRoutes() {
  const session = useSession()
  const route = resolveAppRoute(
    session.isLoading,
    session.hasError,
    session.isAuthenticated,
  )

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
          <button type="button" onClick={session.retryAuthentication}>
            Tentar novamente
          </button>
        </section>
      </main>
    )
  }

  if (route === 'chat') {
    return (
      <AppShell
        accountName={session.userName || session.userEmail || 'Conta Nexo'}
        publicId={session.profile?.publicId ?? null}
        publicIdLoading={session.profileLoading}
        publicIdFailed={session.profileFailed}
        onRetryPublicId={session.retryProfile}
        onLogout={session.logout}
      />
    )
  }

  return (
    <AuthPage
      onLogin={session.login}
      onGoogleLogin={session.loginWithGoogle}
      onForgotPassword={session.forgotPassword}
      onCreateAccount={session.createAccount}
    />
  )
}
