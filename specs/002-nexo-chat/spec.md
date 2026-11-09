# Feature Specification: Nexo Chat

**Feature Branch**: `not created`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Desenvolver o Nexo, uma plataforma de bate-papo em tempo real onde usuários podem conversar com um amigo, adicionar amigos na plataforma, criar grupo e poder adicionar pessoas. Dentro do chat poderão enviar mensagens, áudio, emoji ou anexos (fotos, documentos, PDF etc.). Todo usuário criado deve receber um ID, usado por amigos para adicioná-lo aos contatos do aplicativo. O sistema contará com login para acesso."

## User Scenarios & Validation *(mandatory)*

### User Story 1 - Criar conta e acessar a plataforma (Priority: P1)

Uma pessoa cria/usa uma conta pelo Auth0 com e-mail ou Google, recebe um identificador exclusivo do Nexo e acessa suas conversas e contatos.

**Why this priority**: O acesso autenticado e a identidade do usuário são pré-requisitos para todas as interações privadas da plataforma.

**Validação independente**: Concluir o cadastro/login hospedado pelo Auth0 usando e-mail ou Google, confirmar que a conta recebe um ID exclusivo e sair da plataforma.

**Acceptance Scenarios**:

1. **Given** que uma pessoa ainda não possui conta, **When** ela conclui o cadastro hospedado pelo Auth0 com e-mail ou Google, **Then** sua conta Nexo é vinculada à identidade Auth0 verificada e recebe um ID exclusivo.
2. **Given** que uma conta está cadastrada, **When** seu titular conclui o login pelo Auth0 com e-mail ou Google, **Then** acessa seus contatos e conversas com um access token válido para a API.
3. **Given** que o Auth0 recusa o login ou a API recebe um token inválido/expirado, **When** a pessoa tenta acessar a plataforma, **Then** o acesso é recusado com uma mensagem clara sem revelar credenciais ou detalhes do token.
4. **Given** que o provedor não retorna os dados de perfil exigidos, **When** o usuário conclui o login, **Then** a conta Nexo não é provisionada e a pessoa recebe orientação para corrigir o perfil no provedor.

### User Story 2 - Encontrar e adicionar contatos (Priority: P2)

Uma pessoa compartilha seu ID e outro usuário o usa para localizar sua conta e enviar uma solicitação de amizade. O destinatário pode aceitar ou recusar; contatos aceitos aparecem na lista de contatos.

**Why this priority**: A descoberta por ID conecta usuários sem exigir que dados pessoais, como e-mail, sejam usados como identificador público.

**Validação independente**: Com duas contas existentes, procurar uma pelo ID, enviar uma solicitação, aceitá-la e confirmar que ambas passam a se reconhecer como contatos.

**Acceptance Scenarios**:

1. **Given** que o usuário informa um ID existente que não é o seu, **When** procura esse ID e envia uma solicitação, **Then** o destinatário recebe a solicitação e pode aceitá-la ou recusá-la.
2. **Given** que uma solicitação pendente foi aceita, **When** qualquer um dos usuários abre seus contatos, **Then** o outro usuário aparece na lista.
3. **Given** que o ID informado não existe, **When** o usuário tenta procurá-lo, **Then** recebe uma indicação de que nenhuma conta foi encontrada.
4. **Given** que o usuário procura seu próprio ID ou tenta repetir uma solicitação pendente ou já aceita, **When** confirma a ação, **Then** o sistema impede a duplicação e informa o resultado.

### User Story 3 - Conversar em particular (Priority: P2)

Usuários que são contatos podem iniciar uma conversa individual, trocar mensagens de texto e emojis em tempo real, enviar e reproduzir mensagens de voz e compartilhar fotos, documentos e arquivos PDF.

**Why this priority**: A conversa individual é o principal meio de comunicação descrito para o Nexo.

**Validação independente**: Com duas contas conectadas e vinculadas como contatos, enviar cada tipo de conteúdo admitido e confirmar que o destinatário o recebe e consegue consultá-lo.

**Acceptance Scenarios**:

1. **Given** que dois usuários são contatos, **When** um envia uma mensagem de texto ou emoji, **Then** ela aparece na conversa do destinatário sem que ele precise atualizar a tela.
2. **Given** que o usuário gravou uma mensagem de voz, **When** a envia, **Then** ela aparece na conversa e o destinatário consegue reproduzi-la.
3. **Given** que o usuário seleciona uma foto, documento ou PDF permitido, **When** o envia, **Then** o arquivo aparece associado à conversa e o destinatário consegue visualizá-lo ou baixá-lo.
4. **Given** que um participante está temporariamente desconectado, **When** outro envia uma mensagem, **Then** a mensagem permanece disponível e aparece para o destinatário quando ele voltar à conversa.
5. **Given** que o usuário seleciona um arquivo não permitido ou acima do limite, **When** tenta enviá-lo, **Then** o envio é recusado e os tipos e limites aceitos são informados.
6. **Given** que o envio de uma mensagem falha, **When** o usuário consulta a conversa, **Then** a mensagem é identificada como não enviada e pode ser reenviada.

### User Story 4 - Criar e usar grupos (Priority: P3)

Um usuário cria um grupo, define seu nome e adiciona contatos. Os integrantes podem conversar no mesmo espaço usando os formatos de mensagem disponíveis.

**Why this priority**: Grupos ampliam a comunicação para várias pessoas, depois que contas, contatos e conversas individuais estão disponíveis.

**Validação independente**: Criar um grupo com contatos existentes, confirmar que os convidados o acessam e trocar mensagens entre integrantes.

**Acceptance Scenarios**:

1. **Given** que o criador possui contatos aceitos, **When** cria um grupo e seleciona participantes, **Then** o grupo é criado e seus integrantes conseguem acessá-lo.
2. **Given** que o usuário é integrante de um grupo, **When** envia texto, emoji, áudio ou anexo permitido, **Then** os demais integrantes recebem o conteúdo na conversa do grupo.
3. **Given** que um usuário não é integrante do grupo, **When** tenta acessar suas mensagens, **Then** o acesso é recusado.

### Edge Cases

- Falhas no cadastro/login do Auth0, ou ausência de claims obrigatórios para criar o perfil Nexo, devem ser comunicadas sem revelar credenciais ou tokens.
- IDs não podem ser atribuídos a mais de uma conta; tentativas de adicionar a própria conta ou enviar solicitações duplicadas não devem criar contatos ou solicitações repetidas.
- Uma solicitação recusada ou pendente não deve dar acesso a uma conversa individual reservada a contatos aceitos.
- Mensagens enviadas durante uma desconexão devem permanecer disponíveis; conteúdo que não pôde ser enviado deve ser identificado como não enviado, sem parecer entregue.
- Arquivos não permitidos ou acima dos limites definidos para o produto devem ser recusados antes do envio, com os formatos e limites aceitos informados ao usuário.
- Falhas ao gravar, carregar ou reproduzir áudio e anexos devem ser comunicadas e permitir nova tentativa quando aplicável.
- Ao adicionar participantes a um grupo, contas inexistentes ou já integrantes não devem gerar membros duplicados; pessoas de fora do grupo não devem ver seu conteúdo.
- Se não houver contatos aceitos, a criação de uma conversa individual ou grupo deve explicar como adicionar contatos primeiro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE autenticar e cadastrar usuários via Auth0 Universal Login usando e-mail ou Google; a API DEVE validar access tokens pela assinatura, issuer e audience, sem sessão própria ou `SESSION_SECRET`.
- **FR-002**: O sistema DEVE atribuir a cada conta um ID exclusivo e estável e permitir que seu titular consulte e compartilhe esse ID.
- **FR-003**: O sistema DEVE permitir procurar contas pelo ID e enviar solicitações de amizade, que o destinatário pode aceitar ou recusar.
- **FR-004**: O sistema DEVE impedir solicitações para o próprio usuário e impedir solicitações pendentes ou contatos duplicados.
- **FR-005**: O sistema DEVE exibir os contatos aceitos e permitir iniciar conversas individuais com eles.
- **FR-006**: O sistema DEVE permitir enviar e receber mensagens de texto e emojis em conversas individuais e em grupo.
- **FR-007**: O sistema DEVE permitir gravar, enviar, receber e reproduzir mensagens de voz em conversas individuais e em grupo.
- **FR-008**: O sistema DEVE permitir enviar e receber fotos, documentos e arquivos PDF em conversas individuais e em grupo, informando previamente os tipos e limites aceitos e apresentando erros compreensíveis para arquivos recusados.
- **FR-009**: O sistema DEVE disponibilizar mensagens e conteúdos enviados anteriormente quando os participantes retornarem à conversa, inclusive após uma desconexão.
- **FR-010**: O sistema DEVE permitir criar grupos com nome e adicionar contatos aceitos como integrantes.
- **FR-011**: O sistema DEVE restringir a leitura e o envio de mensagens de um grupo aos seus integrantes.
- **FR-012**: O sistema DEVE identificar mensagens que não foram enviadas e permitir uma nova tentativa, sem indicar falsamente que foram entregues.
- **FR-013**: O sistema DEVE apresentar feedback compreensível para falhas de autenticação, busca de ID, envio, carregamento ou reprodução de conteúdo.

### Key Entities *(include if feature involves data)*

- **Usuário**: Perfil local vinculado ao `sub` imutável verificado do Auth0, com ID exclusivo e estável.
- **Solicitação de amizade**: Pedido de vínculo entre dois usuários, com estado pendente, aceito ou recusado.
- **Contato**: Vínculo entre usuários após a aceitação de uma solicitação.
- **Conversa**: Espaço individual entre contatos ou espaço compartilhado por integrantes de um grupo.
- **Mensagem**: Conteúdo enviado em uma conversa, incluindo texto, emoji, áudio ou referência a um anexo, com autor e momento de envio.
- **Anexo**: Foto, documento ou PDF associado a uma mensagem e sujeito aos tipos e limites informados pelo produto.
- **Grupo**: Conversa coletiva com nome, criador e integrantes autorizados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos novos usuários concluem o cadastro e chegam à sua lista de conversas em até 2 minutos.
- **SC-002**: Pelo menos 95% das buscas por um ID válido exibem a conta correspondente em até 10 segundos.
- **SC-003**: Em condições normais de conectividade, pelo menos 95% das mensagens enviadas a participantes conectados aparecem para eles em até 2 segundos.
- **SC-004**: Pelo menos 90% dos usuários concluem com sucesso, na primeira tentativa, o envio de texto, emoji, mensagem de voz e cada tipo de anexo permitido.
- **SC-005**: Pelo menos 90% dos usuários conseguem criar um grupo e adicionar contatos aceitos em até 2 minutos.
- **SC-006**: Em uma avaliação de usabilidade, pelo menos 85% dos participantes classificam como fácil encontrar alguém pelo ID e iniciar uma conversa.

## Assumptions

- Auth0 Universal Login gerencia cadastro, login, recuperação de credenciais e logout; email/password e Google são métodos habilitados no tenant Auth0. O Google deve estar configurado como conexão Auth0 (`google-oauth2`), não como integração OAuth separada na aplicação.
- O frontend usa o SDK Auth0 com Authorization Code Flow + PKCE e mantém tokens apenas no armazenamento em memória do SDK; a API aceita apenas access tokens destinados à sua audience e não emite cookies ou sessões próprias.
- O ID é gerado no cadastro, não muda durante a vida da conta e é o identificador usado para localizar alguém; o e-mail não é exposto como meio de busca pública.
- A solicitação de amizade precisa ser aceita pelo destinatário antes de os usuários se tornarem contatos.
- “Áudio” significa mensagem de voz gravada e reproduzida dentro da conversa, não chamadas de voz ou vídeo ao vivo.
- O criador do grupo pode adicionar contatos aceitos; recursos de administração avançada, como convites por link ou chamadas, não fazem parte deste escopo.
- Os formatos aceitos e os limites de tamanho e duração de arquivos e áudios são definidos e apresentados pelo produto antes do envio.
- O uso pressupõe conectividade para operações em tempo real; mensagens recebidas durante uma desconexão ficam disponíveis quando o usuário retorna.
