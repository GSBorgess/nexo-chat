import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL

function App() {
  const {
    error,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0()
  const [apiIdentity, setApiIdentity] = useState<string | null>(null)
  const [apiCheckFailed, setApiCheckFailed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setApiIdentity(null)
      setApiCheckFailed(false)
      return
    }

    let active = true

    async function verifyApiIdentity() {
      try {
        const accessToken = await getAccessTokenSilently()
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
          throw new Error('The API did not accept the access token.')
        }

        const identity: { sub: string } = await response.json()
        if (active) {
          setApiIdentity(identity.sub)
        }
      } catch {
        if (active) {
          setApiCheckFailed(true)
        }
      }
    }

    void verifyApiIdentity()

    return () => {
      active = false
    }
  }, [getAccessTokenSilently, isAuthenticated])

  if (isLoading) {
    return (
      <main className="auth-page" aria-live="polite">
        <p>Carregando autenticação...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="auth-title">
          <h1 id="auth-title">Não foi possível autenticar</h1>
          <p role="alert">
            O serviço de autenticação não concluiu a solicitação. Tente
            novamente.
          </p>
          <button type="button" onClick={() => void loginWithRedirect()}>
            Tentar novamente
          </button>
        </section>
      </main>
    )
  }

  if (isAuthenticated) {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="auth-title">
          <p className="auth-eyebrow">Nexo Chat</p>
          <h1 id="auth-title">Bem-vindo{user?.name ? `, ${user.name}` : ''}</h1>
          {user?.email && <p>{user.email}</p>}
          <p className="auth-status">Você está autenticado com o Auth0.</p>
          {apiIdentity && (
            <p className="auth-status">Identidade validada pela API.</p>
          )}
          {apiCheckFailed && (
            <p role="alert">
              A API não validou sua autenticação. Verifique se a API está ativa
              e se o domínio e a audience do Auth0 estão configurados.
            </p>
          )}
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              void logout({
                logoutParams: { returnTo: window.location.origin },
              })
            }
          >
            Sair
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-eyebrow">Nexo Chat</p>
        <h1 id="auth-title">Converse com quem importa</h1>
        <p>Entre ou crie sua conta com segurança.</p>
        <div className="auth-actions">
          <button type="button" onClick={() => void loginWithRedirect()}>
            Continuar com e-mail
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              void loginWithRedirect({
                authorizationParams: { connection: 'google-oauth2' },
              })
            }
          >
            Continuar com Google
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
