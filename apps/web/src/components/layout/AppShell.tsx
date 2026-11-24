import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCheck,
  CirclePlus,
  LogOut,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Users,
  Video,
  X,
} from 'lucide-react'
import { PublicIdCard } from '../../features/profile/PublicIdCard'

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

const conversations: Conversation[] = [
  {
    id: 'emma',
    name: 'Emma Smith',
    preview: 'Perfeito, ainda vale para hoje?',
    time: '09:41',
    initials: 'ES',
    avatar: 'avatar-rose',
    unread: 2,
    messages: [
      { id: '1', text: 'Oi! Que bom falar com você.', time: '09:40' },
      { id: '2', text: 'Como estão as coisas?', time: '09:40' },
      {
        id: '3',
        text: 'Tudo ótimo! E por aí?',
        time: '09:40',
        sent: true,
      },
      {
        id: '4',
        text: 'Tudo certo. Ainda podemos nos encontrar hoje?',
        time: '09:41',
      },
      {
        id: '5',
        text: 'Sim, com certeza! Mal posso esperar',
        time: '09:41',
        sent: true,
      },
    ],
  },
  {
    id: 'james',
    name: 'James Anderson',
    preview: 'Foi muito divertido!',
    time: '09:30',
    initials: 'JA',
    avatar: 'avatar-amber',
    unread: 1,
    messages: [
      { id: '1', text: 'Adorei nosso passeio ontem.', time: '09:28' },
      { id: '2', text: 'Foi muito divertido!', time: '09:30', sent: true },
    ],
  },
  {
    id: 'design',
    name: 'Design Squad',
    preview: 'Olivia: aqui está a última versão',
    time: '08:15',
    initials: 'DS',
    avatar: 'avatar-purple',
    unread: 5,
    isGroup: true,
    messages: [
      { id: '1', text: 'Bom dia, equipe!', time: '08:10' },
      {
        id: '2',
        text: 'Olivia: aqui está a última versão',
        time: '08:15',
      },
    ],
  },
  {
    id: 'olivia',
    name: 'Olivia Brown',
    preview: 'Pode me mandar o arquivo?',
    time: 'Ontem',
    initials: 'OB',
    avatar: 'avatar-teal',
    unread: 0,
    messages: [{ id: '1', text: 'Quando puder, me manda o arquivo?', time: 'Ontem' }],
  },
  {
    id: 'daniel',
    name: 'Daniel Lewis',
    preview: 'Obrigado! Até amanhã.',
    time: 'Ontem',
    initials: 'DL',
    avatar: 'avatar-blue',
    unread: 0,
    messages: [{ id: '1', text: 'Obrigado! Até amanhã.', time: 'Ontem', sent: true }],
  },
]

const stories = [
  { name: 'Emma', initials: 'ES', avatar: 'avatar-rose' },
  { name: 'James', initials: 'JA', avatar: 'avatar-amber' },
  { name: 'Design', initials: 'DS', avatar: 'avatar-blue' },
  { name: 'Olivia', initials: 'OB', avatar: 'avatar-teal' },
]

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
  const [activeId, setActiveId] = useState('emma')
  const [filter, setFilter] = useState<Filter>('Todos')
  const [search, setSearch] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat')
  const activeConversation = conversations.find((conversation) => conversation.id === activeId)

  if (!activeConversation) {
    throw new Error('The active conversation is unavailable.')
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
            aria-label="Nova conversa (em breve)"
            title="Nova conversa em breve"
            disabled
          >
            <Plus size={23} />
          </button>
        </header>

        <section className="stories" aria-label="Stories">
          <button className="story-item own-story" type="button" disabled>
            <span className="story-ring story-add">
              <Plus size={21} />
            </span>
            <span>Sua história</span>
          </button>
          {stories.map((story) => (
            <button className="story-item" type="button" disabled key={story.name}>
              <span className="story-ring">
                <Avatar initials={story.initials} color={story.avatar} size="story" />
              </span>
              <span>{story.name}</span>
            </button>
          ))}
        </section>

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
          <button className="bottom-nav-item" type="button" disabled title="Chamadas em breve">
            <Phone size={20} />
            <span>Chamadas</span>
          </button>
          <button className="bottom-nav-item" type="button" disabled title="Pessoas em breve">
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

      <section className="chat-pane" aria-label={`Conversa com ${activeConversation.name}`}>
        <header className="chat-header">
          <button
            className="icon-button mobile-back"
            type="button"
            aria-label="Voltar para conversas"
            onClick={() => setMobileView('list')}
          >
            <ArrowLeft size={20} />
          </button>
          <Avatar
            initials={activeConversation.initials}
            color={activeConversation.avatar}
            online={!activeConversation.isGroup}
          />
          <div className="chat-contact">
            <h1>{activeConversation.name}</h1>
            <p>
              <span className="online-dot" />
              {activeConversation.isGroup ? 'Grupo' : 'Online agora'}
            </p>
          </div>
          <div className="chat-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Chamada de voz em breve"
              title="Chamadas em breve"
              disabled
            >
              <Phone size={20} />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Chamada de vídeo em breve"
              title="Chamadas em breve"
              disabled
            >
              <Video size={20} />
            </button>
            <button
              className="icon-button mobile-account"
              type="button"
              aria-label={`Sair da conta ${accountName}`}
              onClick={onLogout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="message-list" aria-label="Mensagens de exemplo">
          <span className="date-divider">Hoje</span>
          <div className="message-stack">
            {activeConversation.messages.map((message) => (
              <article
                key={message.id}
                className={message.sent ? 'message-bubble is-sent' : 'message-bubble'}
              >
                <p>{message.text}</p>
                <span className="message-time">
                  {message.time}
                  {message.sent && <CheckCheck size={13} aria-label="Enviada" />}
                </span>
              </article>
            ))}
            {activeConversation.id === 'emma' && (
              <div className="typing-indicator" aria-label="Emma está digitando">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
          <p className="preview-notice">Prévia visual — as conversas serão conectadas em breve.</p>
        </div>

        <div className="message-composer" role="group" aria-label="Compositor de mensagem">
          <button
            className="icon-button composer-add"
            type="button"
            aria-label="Adicionar anexo em breve"
            disabled
          >
            <CirclePlus size={23} />
          </button>
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            aria-label="Digite uma mensagem"
            readOnly
          />
          <button
            className="icon-button composer-emoji"
            type="button"
            aria-label="Emoji em breve"
            disabled
          >
            <Smile size={20} />
          </button>
          <button
            className="send-button"
            type="submit"
            aria-label="Enviar mensagem em breve"
            disabled
          >
            <Send size={20} />
          </button>
        </div>
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
