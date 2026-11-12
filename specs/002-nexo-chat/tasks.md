---
description: "Tarefas executáveis para implementar o Nexo Chat"
---

# Tasks: Nexo Chat

**Input**: Design documents from `specs/002-nexo-chat/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Testing**: Não criar testes automatizados. A constituição exige tipagem estrita, lint e validação manual dos fluxos.

**Organization**: As tarefas estão agrupadas por história de usuário para permitir entregas incrementais. Toda tarefa tem um caminho de arquivo explícito.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar os aplicativos e comandos básicos a partir do repositório, que atualmente contém apenas documentos de planejamento.

- [X] T001 Criar o workspace npm na raiz em `package.json`, declarando `apps/api` e `apps/web` como workspaces e scripts raiz para desenvolvimento, lint e checagem de tipos.
- [X] T002 [P] Inicializar o aplicativo Node.js/Fastify em `apps/api/package.json` e `apps/api/tsconfig.json`, incluindo TypeScript estrito e as dependências Fastify, Prisma, Zod, integração Zod-Fastify, CORS, WebSocket, validação JWT Auth0 e armazenamento S3 compatível.
- [X] T003 [P] Inicializar React com Vite em `apps/web/package.json`, `apps/web/index.html`, `apps/web/vite.config.ts` e `apps/web/tsconfig.json`; instalar e configurar Tailwind CSS, shadcn/ui e Lucide React.
- [X] T004 Configurar qualidade compartilhada em `eslint.config.js`, `.prettierrc.json` e `tsconfig.base.json`, cobrindo ambos os workspaces com TypeScript estrito e scripts executáveis de lint e typecheck.
- [X] T005 [P] Criar `.env.example` com placeholders para configuração do Auth0 no SPA/API, `DATABASE_URL`, origem permitida do frontend e armazenamento privado; não incluir `SESSION_SECRET` ou credenciais Google da aplicação; atualizar `.gitignore` para excluir arquivos `.env` reais.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer infraestrutura reutilizável de API, banco, configuração e interface antes dos fluxos de produto.

**⚠️ CRITICAL**: Concluir esta fase antes das histórias de usuário.

- [X] T006 Configurar PostgreSQL/Prisma em `apps/api/prisma/schema.prisma` e `apps/api/src/infrastructure/database/prisma.ts`, preparando geração do cliente tipado e ciclo de vida da conexão sem antecipar modelos específicos de história.
- [X] T007 Criar validação de configuração com Zod em `apps/api/src/config/env.ts`, validando no startup issuer/domain, audience Auth0 e origem web; falhar com erro explícito quando faltar configuração obrigatória.
- [X] T008 Criar o bootstrap e servidor Fastify em `apps/api/src/app.ts` e `apps/api/src/server.ts`, registrando plugins, rotas versionadas sob `/api` e encerramento gracioso do servidor e do cliente Prisma.
- [ ] T009 Implementar resposta de erro consistente e logging estruturado em `apps/api/src/infrastructure/http/errors.ts` e `apps/api/src/infrastructure/http/error-handler.ts`, sem expor stack traces, segredos ou detalhes internos nas respostas públicas.
- [ ] T010 Implementar a configuração HTTP de `apps/api/src/infrastructure/http/security-plugins.ts` e registrá-la em `apps/api/src/app.ts`: CORS com origens exatas, sem autenticação por cookie; validar bearer access tokens Auth0 nas rotas protegidas e não registrar tokens.
- [ ] T011 [P] Criar a estrutura compartilhada da interface em `apps/web/src/app/App.tsx`, `apps/web/src/app/routes.tsx`, `apps/web/src/components/layout/AppShell.tsx` e `apps/web/src/styles/globals.css`; incorporar a direção Figma (painel lateral e conversa no desktop, superfícies claras com acento roxo, fluxo single-pane em telas estreitas) com foco visível e tokens responsivos.

**Checkpoint**: Os dois aplicativos iniciam, a configuração inválida falha claramente, e a base visual pode renderizar responsivamente.

---

## Phase 3: User Story 1 - Criar conta e acessar a plataforma (Priority: P1) 🎯 MVP

**Goal**: Cadastrar/autenticar por Auth0 Universal Login com e-mail ou Google, vincular a identidade Auth0 ao perfil Nexo, obter ID público estável e permitir logout pelo Auth0.

**Independent Test**: Cadastrar/login via Auth0 com e-mail e Google, confirmar que cada usuário recebe um ID público exclusivo, sair e entrar novamente; confirmar rejeição de tokens ausentes, expirados ou com issuer/audience incorretos.

### Implementation for User Story 1

- [ ] T012 [US1] Definir `User` e `AuthIdentity` e sua migração em `apps/api/prisma/schema.prisma` e `apps/api/prisma/migrations/`; incluir `id` UUID interno, `publicId` aleatório e único, e-mail/perfil derivados de claims verificados, `AuthIdentity.provider=AUTH0` e `providerSubject` único com o claim `sub`; não criar `passwordHash` nem modelo/tabela de sessão.
- [ ] T013 [US1] Implementar geração criptograficamente segura e verificação de colisão do ID Crockford Base32 de 12 caracteres em `apps/api/src/features/auth/public-id.service.ts`, sem derivá-lo do e-mail ou do `sub` Auth0.
- [ ] T014 [US1] Implementar provisionamento idempotente do perfil Nexo a partir de claims de access token Auth0 verificados em `apps/api/src/features/auth/auth.service.ts`; associar pelo `sub` imutável, nunca somente por e-mail, e nunca persistir tokens ou credenciais.
- [ ] T015 [P] [US1] Implementar verificação de access tokens Auth0 em `apps/api/src/infrastructure/auth/require-auth.ts` usando JWKS, issuer e audience configurados; rejeitar tokens inválidos, expirados ou destinados a outra API.
- [ ] T016 [US1] Implementar `GET /api/auth/me` em `apps/api/src/features/auth/auth.routes.ts` e integrar a guarda reutilizável de bearer token; não emitir cookies de sessão nem aceitar ID tokens como credenciais da API.
- [ ] T017 [P] [US1] Criar telas acessíveis de login/retorno Auth0 em `apps/web/src/features/auth/AuthPage.tsx`, usando Auth0 Universal Login para e-mail e conexão Google (`google-oauth2`) configurada no tenant; apresentar erros sem expor tokens.
- [ ] T018 [US1] Integrar o estado Auth0, proteção de rotas e logout em `apps/web/src/app/session.tsx` e `apps/web/src/app/routes.tsx`; exibir o ID público do titular com ação de copiar em `apps/web/src/features/profile/PublicIdCard.tsx`.
- [ ] T019 [US1] Implementar estados vazios e navegação inicial após autenticação em `apps/web/src/features/conversations/EmptyConversations.tsx`, orientando o usuário a adicionar contatos antes de iniciar conversas.

**Checkpoint**: O cadastro, o login/logout e a apresentação segura do ID funcionam sem depender de contatos ou mensagens.

---

## Phase 4: User Story 2 - Encontrar e adicionar contatos (Priority: P2)

**Goal**: Encontrar usuários por ID, enviar/aceitar/recusar pedidos e listar contatos aceitos sem duplicidades.

**Independent Test**: Com duas contas autenticadas, pesquisar o ID da segunda, enviar solicitação, aceitar e confirmar que ambas se listam como contatos; verificar ID inválido/inexistente, auto solicitação e repetição.

### Implementation for User Story 2

- [ ] T020 [US2] Adicionar `Friendship` e migração em `apps/api/prisma/schema.prisma` e `apps/api/prisma/migrations/`; implementar `userLowId`/`userHighId` como “canonical ordered pair of distinct user IDs”, `requestedById` como “user who initiated the current request”, estado “`PENDING`, `ACCEPTED`, or `DECLINED`” e timestamps; garantir “unique `(userLowId, userHighId)`” e “requester must be one member of the pair”.
- [ ] T021 [US2] Implementar serviço de amizade em `apps/api/src/features/friendships/friendship.service.ts`: impedir auto solicitação, evitar duplicidade nos estados pendente/aceito, permitir `PENDING -> ACCEPTED | DECLINED` e `DECLINED -> PENDING`, restringir decisão ao destinatário e executar transições em transação.
- [ ] T022 [US2] Implementar `GET /api/users/by-public-id/{publicId}`, `GET/POST /api/friendships` e `PATCH /api/friendships/{friendshipId}` em `apps/api/src/features/friendships/friendship.routes.ts`; validar ID pela expressão `^[0-9A-HJKMNP-TV-Z]{12}$`, autenticar chamadas, não retornar e-mail e mapear inexistência, conflito e entrada inválida para erros claros.
- [ ] T023 [P] [US2] Criar interface de pesquisa pelo ID e solicitação em `apps/web/src/features/contacts/ContactSearch.tsx` e `apps/web/src/features/contacts/friendship-api.ts`, com estados de carregamento, não encontrado, pendente e erro.
- [ ] T024 [US2] Criar lista de solicitações recebidas/enviadas e contatos aceitos em `apps/web/src/features/contacts/ContactLists.tsx`; mostrar ações aceitar/recusar somente para pedidos recebidos e oferecer ação de iniciar conversa para contatos aceitos.

**Checkpoint**: A relação de contato é criada somente após aceitação; busca e solicitações não expõem e-mail nem criam pares duplicados.

---

## Phase 5: User Story 3 - Conversar em particular (Priority: P2)

**Goal**: Abrir conversa direta entre contatos aceitos, trocar conteúdo em tempo real e recuperar mensagens após desconexão ou falha.

**Independent Test**: Com duas contas vinculadas como contatos, testar texto/emoji em tempo real, recuperação de histórico offline, retry sem duplicação, voz reproduzível e envio/download autorizado de cada formato permitido.

### Implementation for User Story 3

- [ ] T025 [US3] Definir `Conversation`, `ConversationMember`, `Message` e `Attachment` e gerar migração em `apps/api/prisma/schema.prisma` e `apps/api/prisma/migrations/`; manter `Conversation.kind` `DIRECT`/`GROUP`, `directKey` “nullable unique canonical key for the two direct participants; required only for `DIRECT`”, `name` “required for groups, null for direct conversations”, `createdById` e `createdAt`; `ConversationMember` com chave composta `(conversationId,userId)`, `role` `OWNER`/`MEMBER`, `joinedAt` e unicidade `(conversationId,userId)`; `Message.kind` `TEXT`/`AUDIO`/`FILE`, `text` obrigatório para `TEXT` e nulo nos demais, `attachmentId` obrigatório para áudio/arquivo e nulo para texto, chave idempotente `(conversationId,authorId,clientMessageId)` e índice `(conversationId,createdAt,id)`; `Attachment` com `objectKey` único, nome original, MIME, bytes, duração opcional, status `PENDING_UPLOAD`/`READY`/`FAILED` e expiração; limitar mídia a JPEG/PNG/WebP/PDF/DOCX/TXT e WebM/Ogg/MP4, arquivos a 25 MiB, áudio a 5 minutos/25 MiB e uploads pendentes não associados a 24 horas.
- [ ] T026 [US3] Implementar leitura/listagem e obtenção idempotente de conversa direta em `apps/api/src/features/conversations/conversation.service.ts` e `apps/api/src/features/conversations/conversation.routes.ts`; exigir amizade `ACCEPTED`, gerar chave canônica dos dois usuários, garantir uma conversa por par e bloquear acesso de não membros.
- [ ] T027 [US3] Implementar gravação e histórico paginado em `apps/api/src/features/messages/message.service.ts` e `apps/api/src/features/messages/message.routes.ts`; persistir antes de responder, aplicar cursor estável `(conversationId,createdAt,id)`, checar membership, aceitar retry com o mesmo `clientMessageId` sem duplicação e distinguir erro de mensagem persistida.
- [ ] T028 [P] [US3] Implementar WebSocket autenticado e schema Zod de frames em `apps/api/src/features/messages/realtime.routes.ts` e `apps/api/src/features/messages/realtime.service.ts`; validar cookie e `Origin` da origem web permitida, autorizar inscrição por membership, validar cada subscribe/unsubscribe, e publicar `message.created` aos membros somente após commit.
- [ ] T029 [P] [US3] Implementar adaptador de storage S3 privado e ciclo de upload em `apps/api/src/features/uploads/object-storage.ts` e `apps/api/src/features/uploads/upload.service.ts`; permitir JPEG/PNG/WebP/PDF/DOCX/TXT e áudio WebM/Ogg/MP4, limitar cada arquivo a 25 MiB e áudio a 5 minutos/25 MiB, verificar conteúdo/tamanho reais no servidor, emitir URL curta após autorizar membership e expirar uploads pendentes não associados em 24 horas.
- [ ] T030 [US3] Implementar `POST /api/uploads`, `POST /api/uploads/{attachmentId}/complete` e `GET /api/attachments/{attachmentId}/download` em `apps/api/src/features/uploads/upload.routes.ts`; exigir membership, validar mídia/duração/tamanho, verificar objeto antes de marcá-lo `READY` e autorizar cada URL de download.
- [ ] T031 [P] [US3] Implementar a área de conversa selecionada e lista de conversas em `apps/web/src/features/conversations/ConversationWorkspace.tsx`, `apps/web/src/features/conversations/MessageList.tsx` e `apps/web/src/features/conversations/ConversationList.tsx`, mantendo o painel, cabeçalho e compositor visual do Figma em telas largas, com navegação single-pane em telas estreitas e histórico com cursor.
- [ ] T032 [US3] Implementar envio de texto e emoji, atualização em tempo real e estado local `PENDING`/`FAILED` com reenvio pelo mesmo `clientMessageId` em `apps/web/src/features/conversations/MessageComposer.tsx` e `apps/web/src/features/conversations/realtime-client.ts`; reconectar e sincronizar histórico persistido após interrupção.
- [ ] T033 [US3] Implementar seleção/preview/download de anexos e gravação/reprodução de voz usando `MediaRecorder` em `apps/web/src/features/conversations/AttachmentControls.tsx` e `apps/web/src/features/conversations/MessageContent.tsx`; apresentar previamente limites de 25 MiB e 5 minutos, rejeitar formatos não permitidos e comunicar falhas recuperáveis de envio/carregamento/reprodução.
- [ ] T034 [US3] Executar e registrar a validação manual da história em `specs/002-nexo-chat/quickstart.md`, cobrindo envio bidirecional, entrega conectada em até 2 segundos sob conectividade normal, reconexão, cursor, retry idempotente, formatos/limites e bloqueio de leitura/download a não membros.

**Checkpoint**: Conversas diretas são persistentes; WebSocket entrega notificações sem substituir o histórico; arquivos permanecem privados e os estados de falha são recuperáveis.

---

## Phase 6: User Story 4 - Criar e usar grupos (Priority: P3)

**Goal**: Criar grupos nomeados com contatos aceitos, adicionar participantes permitidos e usar os formatos já suportados de mensagem.

**Independent Test**: Com contatos aceitos, criar grupo e incluir participantes, enviar texto/emoji/áudio/anexo, confirmar acesso para integrantes e negar leitura/envio para não membros.

### Implementation for User Story 4

- [ ] T035 [US4] Implementar criação transacional de grupos e inclusão de membros em `apps/api/src/features/conversations/group.service.ts`; definir `kind=GROUP`, `name` obrigatório, `createdById`, membership do criador como `OWNER` e demais papéis `MEMBER`; garantir chave única `(conversationId,userId)`, aceitar somente contatos aceitos, limitar inclusão ao owner e rejeitar IDs inexistentes ou participantes já adicionados sem duplicar.
- [ ] T036 [US4] Implementar `POST /api/groups` e `POST /api/groups/{conversationId}/members` em `apps/api/src/features/conversations/group.routes.ts`, validando nome de 1–100 caracteres, lista não vazia sem IDs repetidos, amizade aceita e autorização do owner; retornar a conversa/membership criada ou erro compreensível.
- [ ] T037 [P] [US4] Criar interface acessível de criação e adição de participantes em `apps/web/src/features/conversations/GroupDialog.tsx`, mostrando apenas contatos aceitos, validação do nome e feedback de duplicidade/falha.
- [ ] T038 [US4] Integrar grupos à lista e aos filtros de conversas em `apps/web/src/features/conversations/ConversationList.tsx` e à tela `apps/web/src/features/conversations/ConversationWorkspace.tsx`; reutilizar envio, histórico, anexos e realtime da US3 sem expor conteúdo fora dos integrantes.
- [ ] T039 [US4] Executar e registrar validação manual em `specs/002-nexo-chat/quickstart.md`, cobrindo grupo com contatos aceitos, adição permitida, ausência de membro duplicado, conversa para cada tipo de mensagem suportado e recusa de acesso de não membro.

**Checkpoint**: Grupos reutilizam a persistência e transporte das mensagens diretas; cada leitura, envio e inscrição continua condicionado à membership.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificar segurança, acessibilidade, critérios de sucesso e documentação após as histórias escolhidas.

- [ ] T040 Atualizar `specs/002-nexo-chat/quickstart.md` com os comandos reais de setup, variáveis de ambiente e inicialização de `apps/api` e `apps/web`, mantendo cenários manuais e resultados esperados por história.
- [ ] T041 Revisar `apps/web/src/app/App.tsx`, `apps/web/src/components/layout/AppShell.tsx`, `apps/web/src/features/auth/AuthPage.tsx`, `apps/web/src/features/contacts/ContactSearch.tsx` e `apps/web/src/features/conversations/ConversationWorkspace.tsx` para uso por teclado, foco visível, nomes acessíveis em controles de ícone, anúncios de status/erro, layouts móveis e reflow sem rolagem horizontal; ajustar os componentes citados conforme a constituição e a referência Figma.
- [ ] T042 Validar manualmente os critérios mensuráveis SC-001–SC-006 e registrar as medições/limitações em `specs/002-nexo-chat/quickstart.md`, incluindo tempo de busca, entrega em até 2 segundos sob conectividade normal e tarefas de usabilidade.
- [ ] T043 Executar checagem de tipos estritos e lint dos dois workspaces e revisar `apps/api/src/infrastructure/http/security-plugins.ts`, `apps/api/src/infrastructure/auth/require-auth.ts`, `apps/api/src/features/auth/auth.routes.ts`, `apps/api/src/features/friendships/friendship.routes.ts`, `apps/api/src/features/conversations/conversation.routes.ts`, `apps/api/src/features/messages/message.routes.ts`, `apps/api/src/features/messages/realtime.routes.ts` e `apps/api/src/features/uploads/upload.routes.ts` para autorização em cada leitura/escrita, ausência de tokens/segredos nas respostas, validação server-side de uploads, CORS e origem WebSocket; corrigir achados nos arquivos citados antes de liberar.
- [ ] T044 Executar todos os fluxos manuais de `specs/002-nexo-chat/quickstart.md` no ambiente configurado, verificar os contratos em `specs/002-nexo-chat/contracts/openapi.yaml` e `specs/002-nexo-chat/contracts/realtime.md` contra o comportamento entregue e documentar no quickstart quaisquer cenários não verificados.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências; T002, T003 e T005 podem ser preparados em paralelo após definir o workspace em T001.
- **Foundational (Phase 2)**: Depende de Setup; bloqueia todas as histórias. T006, T007 e T011 podem avançar em paralelo após os aplicativos existirem.
- **User Stories**: Todas dependem da fundação e de US1 para autenticação; as histórias com dependências funcionais adicionais seguem a ordem abaixo.
- **Polish (Phase 7)**: Executar depois das histórias incluídas na entrega; T041 e revisão técnica podem ocorrer em paralelo à atualização documental quando as telas e APIs relevantes estiverem prontas.

### User Story Dependencies

- **US1 (P1)**: Após Phase 2; independente das demais histórias. Entrega o primeiro MVP utilizável: Auth0 login/logout, perfil vinculado e ID estável.
- **US2 (P2)**: Após US1; requer conta/sessão para procurar e criar solicitações.
- **US3 (P2)**: Após US1 e US2; conversas diretas são reservadas a contatos aceitos. Inclui persistência, realtime e os tipos de conteúdo especificados.
- **US4 (P3)**: Após US1, US2 e US3; grupos usam contatos aceitos, memberships, histórico e transporte de mensagens já implementados.
- **Incrementos independentes**: Cada história tem critério manual próprio, mas a integração de produto não é independente de autenticação e das dependências listadas.

### Within Each User Story

- Definir modelo/migração antes dos serviços que persistem esses dados.
- Implementar serviços e autorização antes de expor endpoints.
- Implementar endpoints antes de integrar telas e interações.
- Marcar `[P]` apenas em tarefas de arquivos distintos que não dependem de outra tarefa incompleta; não criar tarefas de testes automatizados.

### Parallel Opportunities

- Setup: T002 e T003 podem ser preparados em paralelo após T001; T005 é independente de ambos.
- Fundação: T006, T007 e T011 envolvem arquivos distintos e podem avançar em paralelo após Setup.
- US1: T015 e T017 podem avançar em paralelo às tarefas de serviço após T012 e a definição dos contratos de entrada/saída.
- US2: T023 pode avançar em paralelo ao serviço de amizade, usando o contrato já documentado.
- US3: T028, T029 e T031 usam arquivos distintos e podem avançar em paralelo depois que o modelo de dados estiver acordado; endpoints de upload dependem do adaptador/modelo e da autorização.
- US4: T037 pode avançar em paralelo aos endpoints de grupo usando `contracts/openapi.yaml`.
- Após US3: trabalho de interface e serviço de grupo pode ser dividido entre pessoas; a integração T038 depende de US3.

### Parallel Example: Setup

```text
Depois de T001:
Task: T002 API Node/Fastify em apps/api/
Task: T003 React/Vite em apps/web/
Task: T005 exemplos de ambiente e .gitignore na raiz
```

### Parallel Example: User Story 3

```text
Depois de T025:
Task: T028 WebSocket autenticado em apps/api/src/features/messages/realtime.*
Task: T029 storage/upload em apps/api/src/features/uploads/object-storage.ts e upload.service.ts
Task: T031 workspace e lista de mensagens em apps/web/src/features/conversations/
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir Setup e Foundational.
2. Entregar US1: cadastro e login por e-mail/senha e Google, sessão segura, logout e ID público.
3. Validar o fluxo manual independente da US1 e executar lint/typecheck.
4. Usar US1 como primeiro incremento demonstrável; contatos e conversas ainda não fazem parte deste MVP.

### Incremental Delivery

1. Adicionar US2 para busca por ID, solicitações e lista de contatos.
2. Adicionar US3 para conversa direta, persistência, texto/emoji, voz e anexos.
3. Adicionar US4 para grupos usando contatos e infraestrutura de mensagens existente.
4. Concluir Polish e repetir os fluxos manuais relevantes do quickstart.

## Notes

- `[P]` identifica somente tarefas paralelizáveis; `[US1]`–`[US4]` vinculam tarefas às histórias correspondentes.
- Os números e descrições dos requisitos continuam em `specs/002-nexo-chat/spec.md`; entidades em `data-model.md`; contratos HTTP/realtime em `contracts/`.
- A interface usa a referência Figma como orientação visual; controles de telefone/vídeo não implementam chamadas, fora do escopo atual.
- O projeto exige validação manual, typecheck e lint; não adicionar testes automatizados sem alteração da constituição.
