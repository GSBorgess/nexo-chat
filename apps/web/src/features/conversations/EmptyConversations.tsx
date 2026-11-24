import { MessageCircle, Plus } from 'lucide-react'

interface EmptyConversationsProps {
  onAddContacts: () => void
}

export function EmptyConversations({ onAddContacts }: EmptyConversationsProps) {
  return (
    <section className="empty-conversations" aria-labelledby="empty-conversations-title">
      <span className="empty-conversations-icon" aria-hidden="true">
        <MessageCircle size={34} />
      </span>
      <h1 id="empty-conversations-title">Nenhuma conversa por enquanto</h1>
      <p>
        Adicione contatos pelo ID público deles para encontrar pessoas e começar a conversar.
      </p>
      <button type="button" className="empty-conversations-action" onClick={onAddContacts}>
        <Plus size={18} />
        Adicionar contatos
      </button>
    </section>
  )
}
