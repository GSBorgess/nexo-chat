import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { AppRoutes, resolveAppRoute } from './routes'

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

  const route = resolveAppRoute(isLoading, Boolean(error), isAuthenticated)

  return (
    <AppRoutes
      route={route}
      userName={user?.name}
      userEmail={user?.email}
      apiIdentity={apiIdentity}
      apiCheckFailed={apiCheckFailed}
      onRetry={() => void loginWithRedirect()}
      onLogin={(email) =>
        void loginWithRedirect({
          authorizationParams: { login_hint: email },
        })
      }
      onGoogleLogin={() =>
        void loginWithRedirect({
          authorizationParams: { connection: 'google-oauth2' },
        })
      }
      onForgotPassword={(email) =>
        void loginWithRedirect({
          authorizationParams: email ? { login_hint: email } : {},
        })
      }
      onCreateAccount={() =>
        void loginWithRedirect({
          authorizationParams: { screen_hint: 'signup' },
        })
      }
      onLogout={() =>
        void logout({
          logoutParams: { returnTo: window.location.origin },
        })
      }
    />
  )
}

export default App
