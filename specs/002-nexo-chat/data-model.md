# Modelo de Dados: Nexo Chat

O PostgreSQL é a fonte de verdade para a identidade e o estado do chat. Todas as chaves primárias são UUIDs internas; o ID público do Nexo é um valor separado e estável para consulta. O Prisma modela as relações, enquanto as migrações podem adicionar verificações ou índices do PostgreSQL que não são representados diretamente no schema do Prisma.

## Entidades

### Usuário

- `id`: chave primária UUID, interna apenas.
- `publicId`: ID público único, imutável e aleatório com 12 caracteres em maiúsculas no formato Crockford Base32; indexado para busca exata.
- `email`: e-mail do perfil proveniente de um claim verificado do Auth0; nunca usado para busca pública ou vinculação de identidade.
- `displayName`: nome do perfil obrigatório.
- `createdAt`: data de criação da conta.
- Relações: identidade Auth0, amizades, memberships em conversas e mensagens autoradas.
- Validação: criar/vincular o perfil apenas a partir de um access token verificado; nunca vincular identidades apenas por e-mail; nunca devolver `email` em perfis públicos ou respostas de busca por ID.

### AuthIdentity

- `id`: chave primária UUID; `userId`: usuário proprietário.
- `provider`: `AUTH0`.
- `providerSubject`: subject verificado do Auth0 (`sub`), independentemente de o login ter sido por e-mail/senha ou Google.
- `createdAt`.
- Restrições: unique `(provider, providerSubject)` e unique `userId` (uma identidade Auth0 por usuário do Nexo).
- Validação: criar/vincular apenas após verificação da assinatura, emissor e audiência do access token no lado da API; não vincular apenas por correspondência de e-mail. O Auth0 é responsável pelo ciclo de login/logout e sessão; a aplicação não persiste credenciais, access tokens, tokens de sessão ou registros de sessão.

### Friendship

- `id`: chave primária UUID.
- `userLowId`, `userHighId`: par canônico ordenado de IDs distintos do usuário.
- `requestedById`: usuário que iniciou a solicitação atual.
- `status`: `PENDING`, `ACCEPTED` ou `DECLINED`.
- `createdAt`, `updatedAt`.
- Restrições: unique `(userLowId, userHighId)`; IDs devem ser diferentes; o solicitante deve ser um membro do par.
- Transições de estado: `PENDING -> ACCEPTED | DECLINED`; `DECLINED -> PENDING` para uma nova solicitação. `ACCEPTED` representa a relação de contato. Solicitações repetidas pendentes e solicitações para um par já aceito são rejeitadas sem duplicações. As respostas incluem se o usuário atual é o solicitante ou o destinatário.
- Relações: ambos os usuários relacionados.

### Conversation

- `id`: chave primária UUID.
- `kind`: `DIRECT` ou `GROUP`.
- `directKey`: chave canônica nullable para os dois participantes diretos; obrigatória apenas para `DIRECT`.
- `name`: obrigatório para grupos, nulo para conversas diretas.
- `createdById`, `createdAt`.
- Relações: membros e mensagens.
- Restrições: cada par direto tem no máximo uma conversa; registros de membership garantem unicidade de participantes. Adicionar uma checagem no banco para combinações válidas de campos de conversa direta/grupo.

### ConversationMember

- `conversationId`, `userId`: chave primária composta.
- `role`: `OWNER` ou `MEMBER`; o criador do grupo é o owner.
- `joinedAt`.
- Restrições: unique `(conversationId, userId)`.
- Validação: operações de criação de grupo/adicionar membro aceitam apenas contatos aceitos existentes; apenas o proprietário do grupo pode adicionar membros. Leituras de conversa, subscriptions, envio de mensagens e acesso a anexos exigem membership.

### Attachment

- `id`: chave primária UUID; `conversationId`, `uploadedById`.
- `objectKey`: chave opaca única em armazenamento privado de objetos.
- `originalName`, `mediaType`, `sizeBytes`, `durationMs` opcional.
- `status`: `PENDING_UPLOAD`, `READY` ou `FAILED`; `createdAt`, `expiresAt` (expiração de 24h para uploads pendentes não associados).
- Validação: aceitar arquivos JPEG, PNG, WebP, PDF, DOCX ou TXT e áudio WebM, Ogg ou MP4; rejeitar objetos acima de 25 MiB. O áudio também deve ter no máximo 5 minutos. Normalizar os tipos MIME para a essência do tipo de mídia e verificar o tamanho/conteúdo real no servidor; não confiar no MIME do navegador nem no nome do arquivo. Uploads curtos não associados são elegíveis para limpeza.

### Message

- `id`: chave primária UUID.
- `conversationId`, `authorId`.
- `clientMessageId`: chave de retry/ idempotência gerada pelo cliente.
- `kind`: `TEXT`, `AUDIO` ou `FILE`.
- `text`: obrigatório para `TEXT`, nulo para `AUDIO`/`FILE`.
- `attachmentId`: obrigatório para `AUDIO`/`FILE`, nulo para `TEXT`; único quando presente.
- `createdAt`.
- Restrições: unique `(conversationId, authorId, clientMessageId)`; índice `(conversationId, createdAt, id)` para paginação de cursor estável.
- Validação: o autor deve ser um membro atual da conversa; o anexo referenciado deve estar `READY`, na mesma conversa e enviado por um participante autorizado.
- Semântica de entrega: persistir antes de confirmar ou transmitir; o navegador acompanha o estado local `PENDING`/`FAILED` e tenta novamente com a mesma chave. As mensagens do servidor são persistidas e, portanto, recuperáveis no histórico.

## Invariantes de autorização e transação

- A aceitação de pedido de amizade e a criação de grupo/inserção de membros são transacionais.
- A busca/criação de conversa direta usa o par canônico de participantes e é idempotente.
- Toda consulta de histórico e operação de mensagem/upload verifica membership na lógica da aplicação; chaves estrangeiras do banco sozinhas não autorizam acesso.
- O endpoint de conclusão do upload verifica metadados do objeto antes de definir `READY`; a emissão de URL de download verifica membership na conversa.
- O histórico de mensagens e anexos confirmados não expira automaticamente nesta funcionalidade; controles de exclusão/retensão estão fora do escopo. Limpar uploads pendentes não associados após 24 horas.
- Tokens Auth0 de acesso/ID e segredos do provedor nunca são incluídos em schemas públicos de resposta da API ou logs. Todo chamador da API é autenticado a partir de um access token Auth0 verificado.
