import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE
const apiUrl = import.meta.env.VITE_API_URL

if (!auth0Domain || !auth0ClientId || !auth0Audience || !apiUrl) {
  throw new Error(
    'Authentication is not configured. Set VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE, and VITE_API_URL.',
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience,
      }}
      cacheLocation="memory"
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
