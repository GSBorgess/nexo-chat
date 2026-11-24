import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface AuthProfile {
  sub: string
  publicId: string
  displayName: string
}

interface SessionContextValue {
  isLoading: boolean
  isAuthenticated: boolean
  hasError: boolean
  profile: AuthProfile | null
  profileLoading: boolean
  profileFailed: boolean
  userName: string | undefined
  userEmail: string | undefined
  retryAuthentication: () => void
  retryProfile: () => void
  login: (email: string) => void
  loginWithGoogle: () => void
  forgotPassword: (email: string) => void
  createAccount: () => void
  logout: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

const apiUrl = import.meta.env.VITE_API_URL

export function SessionProvider({ children }: PropsWithChildren) {
  const {
    error,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: logoutFromAuth0,
    user,
  } = useAuth0()
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileFailed, setProfileFailed] = useState(false)

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null)
      setProfileLoading(false)
      setProfileFailed(false)
      return
    }

    setProfileLoading(true)
    setProfileFailed(false)

    try {
      const accessToken = await getAccessTokenSilently()
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        throw new Error('The API did not accept the access token.')
      }

      const nextProfile: unknown = await response.json()
      if (
        typeof nextProfile !== 'object' ||
        nextProfile === null ||
        !('sub' in nextProfile) ||
        typeof nextProfile.sub !== 'string' ||
        !('publicId' in nextProfile) ||
        typeof nextProfile.publicId !== 'string' ||
        !('displayName' in nextProfile) ||
        typeof nextProfile.displayName !== 'string'
      ) {
        throw new Error('The API returned an invalid profile.')
      }
      setProfile({
        sub: nextProfile.sub,
        publicId: nextProfile.publicId,
        displayName: nextProfile.displayName,
      })
    } catch {
      setProfile(null)
      setProfileFailed(true)
    } finally {
      setProfileLoading(false)
    }
  }, [getAccessTokenSilently, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      void loadProfile()
    } else {
      setProfile(null)
      setProfileLoading(false)
      setProfileFailed(false)
    }
  }, [isAuthenticated, loadProfile])

  const value = useMemo<SessionContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      hasError: Boolean(error),
      profile,
      profileLoading,
      profileFailed,
      userName: user?.name,
      userEmail: user?.email,
      retryAuthentication: () => void loginWithRedirect(),
      retryProfile: () => void loadProfile(),
      login: (email) =>
        void loginWithRedirect({
          authorizationParams: { login_hint: email },
        }),
      loginWithGoogle: () =>
        void loginWithRedirect({
          authorizationParams: { connection: 'google-oauth2' },
        }),
      forgotPassword: (email) =>
        void loginWithRedirect({
          authorizationParams: email ? { login_hint: email } : {},
        }),
      createAccount: () =>
        void loginWithRedirect({
          authorizationParams: { screen_hint: 'signup' },
        }),
      logout: () =>
        void logoutFromAuth0({
          logoutParams: { returnTo: window.location.origin },
        }),
    }),
    [
      error,
      isAuthenticated,
      isLoading,
      loadProfile,
      loginWithRedirect,
      logoutFromAuth0,
      profile,
      profileFailed,
      profileLoading,
      user?.email,
      user?.name,
    ],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error('useSession must be used within SessionProvider.')
  }

  return session
}
