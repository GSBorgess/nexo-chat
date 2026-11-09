# Plano de Implementação: Nexo Chat

**Branch**: `002-nexo-chat` | **Data**: 2026-11-03 | **Especificação**: [spec.md](./spec.md)

## Resumo

Entregar o chat web do Nexo como um cliente React e uma API Fastify dedicada, apoiada por PostgreSQL/Prisma. O Auth0 fornece login com e-mail e Google; o SPA obtém access tokens e a API os valida de acordo com o issuer e audience do Auth0. Os usuários encontram uns aos outros usando IDs públicos estáveis, gerenciam pedidos de amizade e trocam mensagens diretas ou em grupo, com persistência. Os endpoints HTTP são responsáveis por escrita e histórico; conexões WebSocket autenticadas entregam notificações em tempo real. Os bytes de áudio e arquivos ficam em armazenamento privado compatível com S3, com metadados no PostgreSQL. O cliente usa telas orientadas por funcionalidade, primitivas acessíveis do shadcn/ui, Tailwind CSS e ícones Lucide.

## Contexto Técnico

**Linguagem/Versão**: TypeScript com checagem estrita; Node.js LTS suportado (fixar versões exatas na inicialização do projeto).
**Dependências Principais**: React, `@auth0/auth0-react`, Fastify, Prisma, Zod, `jose`, `@fastify/websocket`, Tailwind CSS, shadcn/ui, Lucide e um adaptador de armazenamento de objetos compatível com S3.
**Armazenamento**: PostgreSQL para perfis de usuários vinculados ao Auth0, amizades, conversas, mensagens e metadados de anexos; armazenamento privado compatível com S3 para objetos de arquivo/áudio. O Auth0 continua sendo a fonte de credenciais de autenticação; a aplicação não armazena senhas nem sessões.
**Testes**: A constituição não exige nem permite adicionar testes automatizados para este projeto. Validar com checagem de tipos TypeScript estrita, lint e fluxos manuais de ponta a ponta em `quickstart.md`.
**Plataforma Alvo**: navegadores web desktop; servidor API em Node.js.
**Tipo de Projeto**: aplicação web com frontend e backend implantáveis separadamente.
**Metas de Desempenho**: atender aos resultados da especificação: 95% das buscas válidas por ID em até 10 segundos, 95% das mensagens para participantes conectados visíveis em até 2 segundos em conectividade normal, e os alvos de usabilidade de cadastro/criação de grupo informados.
**Restrições**: Auth0 Universal Login para e-mail e Google (Google habilitado como conexão do Auth0); access tokens da API validados por assinatura, issuer e audience; sem cookie de sessão da aplicação nem `SESSION_SECRET`; CORS e verificações de origem do WebSocket em origem exata; autorização em toda ação de conversa/histórico/upload; armazenamento privado; imagens (JPEG/PNG/WebP), PDF/DOCX/TXT e máximo de 25 MiB por anexo; áudio de voz em WebM/Ogg/MP4 limitado a 5 minutos e 25 MiB. Aplicar limites no servidor e exibi-los antes do upload.
**Escala/Âmbito**: lançamento inicial para volume de usuários/concorrência não especificado; não há meta de escalonamento horizontal definida. Persistir todas as mensagens aceitas e reconciliar eventos ao vivo perdidos a partir do histórico paginado. Adicionar pub/sub entre instâncias apenas quando o deploy exigir múltiplas instâncias da API.

## Verificação da Constituição

| Princípio | Gate | Plano |
|---|---|---|
| I. Valor ao usuário e comportamento claro | Pass | Cada fluxo incluído mapeia para cenários, erros ou critérios de sucesso da especificação. |
| II. Arquitetura limpa e orientada por funcionalidade | Pass | Aplicações web e API separadas; isolar domínio, aplicação, infraestrutura e preocupações de apresentação dentro dos recursos da API. |
| III. Qualidade sem testes automatizados | Pass | Nenhuma suíte de testes foi planejada; checagem estrita de TypeScript, lint e validação manual de fluxos são exigidos. |
| IV. Privacidade e segurança desde o desenho | Pass | O Auth0 possui credenciais e login; a API valida tokens vinculados à audience sem sessões da aplicação ou `SESSION_SECRET`. IDs públicos são separados dos internos; verificações de membership, acesso privado a objetos e validação de upload são explícitas. |
| V. UX acessível e resiliente | Pass | UI responsiva e acessível por teclado, além de estados visíveis e recuperáveis de envio, reconexão e upload, fazem parte do desenho e do quickstart. |
| Revisão adicional de dependências/serviços | Pass com justificativa | O Auth0 é necessário para autenticação hospedada por e-mail/Google, e o armazenamento privado compatível com S3 é necessário para a capacidade de áudio e anexos especificada. Ambas as dependências e sua configuração operacional estão documentadas. |

Nenhuma violação da constituição foi identificada. A revisão pós-design permanece aprovada: o desenho mantém a mesma separação, controles de segurança, política de validação manual e comportamento acessível/recuperável do usuário.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/002-nexo-chat/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── openapi.yaml
    └── realtime.md
```

### Código-fonte (planejado)

```text
apps/
├── api/
│   ├── prisma/
│   └── src/
│       ├── features/
│       │   ├── auth/
│       │   ├── friendships/
│       │   ├── conversations/
│       │   ├── messages/
│       │   └── uploads/
│       └── infrastructure/
└── web/
    └── src/
        ├── features/
        │   ├── auth/
        │   ├── contacts/
        │   ├── conversations/
        │   └── profile/
        ├── components/
        └── lib/
```

**Decisão de Estrutura**: o repositório atualmente contém documentos de planejamento, não uma aplicação. Usar dois apps implantáveis para honrar o requisito de backend dedicado da constituição. Manter Prisma e segredos somente do servidor em `apps/api`; manter UI e estado local de interação em `apps/web`. Usar o [design do Figma](https://www.figma.com/make/hQBtdDBnOD3XzhcxaOevGj/Chat-App?p=f&t=PUMWhm1j6Oql3L2F-0) do usuário como referência visual para o chat desktop em dois painéis, paleta roxa/clarinha, superfícies arredondadas de conversa e fluxo responsivo de um painel em telas mobile. Os recursos de telefone/vídeo na maquete não acrescentam ligações em tempo real ao escopo desta funcionalidade. O contrato da API é a fronteira de integração; evitar um pacote de runtime compartilhado até que a implementação demonstre uma necessidade concreta.

## Rastreamento de Complexidade

Nenhuma violação da constituição exige justificativa.
