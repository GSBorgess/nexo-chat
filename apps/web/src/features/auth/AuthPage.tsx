import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'

interface AuthPageProps {
  onLogin: (email: string) => void
  onGoogleLogin: () => void
  onForgotPassword: (email: string) => void
  onCreateAccount: () => void
}

export function AuthPage({
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onCreateAccount,
}: AuthPageProps) {
  const [email, setEmail] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onLogin(email.trim())
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <section className="login-brand-panel" aria-label="Sobre o Nexo">
          <a className="login-brand" href="/" aria-label="Nexo">
            <span className="login-brand-mark" aria-hidden="true">
              n
            </span>
            <span>nexo</span>
          </a>

          <div className="login-brand-copy">
            <p className="login-kicker">CONEXÕES QUE IMPORTAM</p>
            <h1>
              Suas conversas,
              <br />
              mais perto de
              <br />
              você.
            </h1>
            <p className="login-brand-description">
              Entre e continue compartilhando momentos com quem faz parte da sua história.
            </p>
          </div>

          <div className="login-chat-preview" aria-hidden="true">
            <div className="login-preview-person">
              <span className="login-preview-avatar">M</span>
              <span className="login-preview-name">
                <strong>Marina</strong>
                <small>online agora</small>
              </span>
              <span className="login-preview-presence" />
            </div>
            <p className="login-preview-message">Oi! Que bom ver você por aqui.</p>
            <p className="login-preview-message is-outgoing">Também senti sua falta!</p>
            <span className="login-preview-typing">
              <i />
              <i />
              <i />
            </span>
          </div>
        </section>

        <section className="login-form-panel" aria-labelledby="login-title">
          <div className="login-content">
            <p className="login-eyebrow">BEM-VINDO DE VOLTA</p>
            <h2 id="login-title">Entre na sua conta</h2>
            <p className="login-subtitle">Que bom ter você aqui novamente.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="login-email">E-mail</label>
              <span className="login-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
              <div className="login-form-options">
                <span>Você entrará com segurança pelo Auth0.</span>
                <button
                  className="login-text-button"
                  type="button"
                  onClick={() => onForgotPassword(email.trim())}
                >
                  Esqueci minha senha
                </button>
              </div>
              <button className="login-submit" type="submit">
                Entrar
              </button>
            </form>

            <div className="login-divider" aria-hidden="true">
              <span>ou continue com</span>
            </div>

            <button className="login-google" type="button" onClick={onGoogleLogin}>
              <span className="login-google-mark" aria-hidden="true">
                G
              </span>
              Entrar com Google
            </button>

            <p className="login-signup">
              Ainda não tem uma conta?{' '}
              <button className="login-text-button" type="button" onClick={onCreateAccount}>
                Criar conta
              </button>
            </p>

            <p className="login-legal">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
