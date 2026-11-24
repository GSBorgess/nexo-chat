import { useMemo, useState } from 'react'
import {
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'
import { PublicIdCard } from '../../features/profile/PublicIdCard'
import { EmptyConversations } from '../../features/conversations/EmptyConversations'

type Filter = 'Todos' | 'Grupos' | 'Não lidas'

interface Conversation {
  id: string
  name: string
  preview: string
  time: string
  initials: string
  avatar: string
  unread: number
  isGroup?: boolean
  messages: { id: string; text: string; time: string; sent?: boolean }[]
}

const conversations: Conversation[] = []

interface AppShellProps {
  accountName: string
  publicId: string | null
  publicIdLoading: boolean
  publicIdFailed: boolean
  onRetryPublicId: () => void
  onLogout: () => void
}

export function AppShell({
  accountName,
  publicId,
  publicIdLoading,
  publicIdFailed,
  onRetryPublicId,
  onLogout,
}: AppShellProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('Todos')
  const [search, setSearch] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  function openAddContacts() {
    setMobileView('list')
    document.getElementById('public-id-card')?.scrollIntoView({ behavior: 'smooth' })
    document.getElementById('public-id-card')?.focus()
  }

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')

    return conversations.filter((conversation) => {
      const matchesSearch =
        !query ||
        conversation.name.toLocaleLowerCase('pt-BR').includes(query) ||
        conversation.preview.toLocaleLowerCase('pt-BR').includes(query)
      const matchesFilter =
        filter === 'Todos' ||
        (filter === 'Grupos' && conversation.isGroup) ||
        (filter === 'Não lidas' && conversation.unread > 0)

      return matchesSearch && matchesFilter
    })
  }, [filter, search])

  function selectConversation(id: string) {
    setActiveId(id)
    setMobileView('chat')
  }

  return (
    <main className="app-shell" data-mobile-view={mobileView}>
      <aside className="sidebar" aria-label="Painel de conversas">
        <header className="sidebar-header">
          <button
            className="icon-button sidebar-menu"
            type="button"
            aria-label="Menu em breve"
            title="Menu em breve"
            disabled
          >
            <Menu size={19} />
          </button>
          <a className="brand" href="#conversas" aria-label="Nexo, início">
            <span className="brand-mark">n</span>
            <span>nexo</span>
          </a>
          <button
            className="icon-button sidebar-search"
            type="button"
            aria-label="Buscar conversas"
            onClick={() => document.getElementById('conversation-search')?.focus()}
          >
            <Search size={20} />
          </button>
          <button
            className="icon-button add-button"
            type="button"
            aria-label="Adicionar contatos"
            onClick={openAddContacts}
          >
            <Plus size={23} />
          </button>
        </header>

        <div className="conversation-search">
          <Search size={16} aria-hidden="true" />
          <input
            id="conversation-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar conversas"
            aria-label="Buscar conversas"
          />
          {search && (
            <button
              className="clear-search"
              type="button"
              aria-label="Limpar busca"
              onClick={() => setSearch('')}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <nav className="conversation-filters" aria-label="Filtrar conversas">
          {(['Todos', 'Grupos', 'Não lidas'] as const).map((item) => (
            <button
              type="button"
              key={item}
              className={filter === item ? 'filter-chip is-active' : 'filter-chip'}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <section className="conversation-section" id="conversas">
          <div className="section-heading">
            <h2>Mensagens</h2>
            <button type="button" className="text-button" onClick={() => setFilter('Todos')}>
              Ver todas
            </button>
          </div>
          <ul className="conversation-list">
            {visibleConversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={
                    activeId === conversation.id
                      ? 'conversation-item is-selected'
                      : 'conversation-item'
                  }
                  aria-current={activeId === conversation.id ? 'true' : undefined}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <Avatar
                    initials={conversation.initials}
                    color={conversation.avatar}
                    online={conversation.id === 'emma' || conversation.id === 'james'}
                    group={conversation.isGroup ?? false}
                  />
                  <span className="conversation-copy">
                    <span className="conversation-name">{conversation.name}</span>
                    <span className="conversation-preview">{conversation.preview}</span>
                  </span>
                  <span className="conversation-meta">
                    <time>{conversation.time}</time>
                    {conversation.unread > 0 && (
                      <span className="unread-count">{conversation.unread}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
            {visibleConversations.length === 0 && (
              <li className="empty-search" role="status">
                Nenhuma conversa encontrada.
              </li>
            )}
          </ul>
        </section>

        <PublicIdCard
          publicId={publicId}
          loading={publicIdLoading}
          failed={publicIdFailed}
          onRetry={onRetryPublicId}
        />

        <nav className="bottom-nav" aria-label="Navegação principal">
          <a className="bottom-nav-item is-active" href="#conversas" aria-current="page">
            <MessageCircle size={20} />
            <span>Chats</span>
          </a>
          <button
            className="bottom-nav-item"
            type="button"
            onClick={openAddContacts}
          >
            <Users size={20} />
            <span>Pessoas</span>
          </button>
          <button
            className="bottom-nav-item"
            type="button"
            onClick={onLogout}
            aria-label={`Sair da conta ${accountName}`}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      <section className="chat-pane" aria-label="Nenhuma conversa selecionada">
        <EmptyConversations onAddContacts={openAddContacts} />
      </section>
    </main>
  )
}

interface AvatarProps {
  initials: string
  color: string
  online?: boolean
  group?: boolean
  size?: 'regular' | 'story'
}

function Avatar({ initials, color, online = false, group = false, size = 'regular' }: AvatarProps) {
  return (
    <span
      className={`avatar ${color} avatar-${size}${group ? ' is-group' : ''}`}
      aria-hidden="true"
    >
      {group ? <Users size={19} /> : initials}
      {online && <span className="presence-dot" />}
    </span>
  )
}
