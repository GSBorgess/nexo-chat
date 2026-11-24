import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface PublicIdCardProps {
  publicId: string | null
  loading: boolean
  failed: boolean
  onRetry: () => void
}

export function PublicIdCard({
  publicId,
  loading,
  failed,
  onRetry,
}: PublicIdCardProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copyPublicId() {
    if (!publicId) {
      return
    }

    try {
      await navigator.clipboard.writeText(publicId)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <section
      id="public-id-card"
      className="public-id-card"
      aria-labelledby="public-id-title"
      tabIndex={-1}
    >
      <div>
        <p id="public-id-title">Seu ID público</p>
        {loading && <span className="public-id-value" role="status">Carregando...</span>}
        {publicId && <code className="public-id-value">{publicId}</code>}
        {failed && (
          <button className="public-id-retry" type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
      {publicId && (
        <button
          className="public-id-copy"
          type="button"
          onClick={() => void copyPublicId()}
          aria-label="Copiar ID público"
        >
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
      {copyState !== 'idle' && (
        <span className="public-id-status" role="status">
          {copyState === 'copied'
            ? 'ID copiado.'
            : 'Não foi possível copiar. Selecione o ID.'}
        </span>
      )}
    </section>
  )
}
