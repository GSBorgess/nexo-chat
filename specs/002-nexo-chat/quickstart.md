# Quickstart: Validação do Nexo Chat

Este guia valida a primeira implementação de ponta a ponta em relação ao [modelo de dados](./data-model.md) e aos [contratos de API/realtime](./contracts/openapi.yaml). As suítes de testes automatizados são intencionalmente excluídas pela constituição do projeto.

## Pré-requisitos

- Node.js LTS suportado e npm.
- PostgreSQL disponível para a API.
- Um tenant Auth0 com um Single Page Application e uma API registradas, e-mail/senha habilitado, e a conexão Google (`google-oauth2`) ativada. Configure as origens locais de callback/logout/web no SPA e a audience da API.
- Um bucket privado compatível com S3 e credenciais do lado do servidor.
- Variáveis de ambiente configuradas para Auth0, banco de dados, origem permitida do frontend e armazenamento de objetos. Valide a configuração obrigatória na inicialização; nunca configure `SESSION_SECRET` nem credenciais do cliente OAuth do Google nesta aplicação.
- O frontend e a API estão rodando em origens locais configuradas separadamente, com CORS credenciado limitado à origem do frontend.

O app web inicia com `npm run dev --workspace=@nexo-chat/web`; os comandos raiz `npm run typecheck` e `npm run lint` executam as verificações de workspace configuradas. O bootstrap do servidor da API e o endpoint de verificação do Auth0 continuam pendentes nas tarefas de implementação, portanto as verificações de ponta a ponta da API não podem passar até que essas tarefas sejam concluídas.

## Fluxo de validação

1. **Configurar Auth0 e iniciar o app web**
   - Configure o domínio Auth0, o client ID do SPA e a audience da API em `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID` e `VITE_AUTH0_AUDIENCE`; configure o issuer/domínio e a audience da API em `AUTH0_DOMAIN` e `AUTH0_AUDIENCE`.
   - Inicie o app web com `npm run dev --workspace=@nexo-chat/web`. Confirme que a configuração faltante do Auth0 no frontend produz um erro claro de inicialização.
2. **Registrar e autenticar**
   - Registre/entre com duas pessoas via Auth0 Universal Login usando e-mail/senha; verifique se cada uma recebe um ID público estável e distinto do Nexo.
   - Faça logout e login novamente pelo Auth0; verifique se a falha de login é reportada sem expor detalhes do provedor.
   - Conclua o login com Google pela conexão Auth0 `google-oauth2` e verifique se ela resolve para um subject do Auth0, recebe um ID público estável do Nexo e não expõe provider/access tokens.
   - Depois de implementadas as tarefas de autenticação da API, chame o endpoint protegido com um access token do Auth0 para a audience configurada; verifique que um token válido funciona e que um token ausente, expirado, de issuer ou audience incorretos seja rejeitado. Confirme que ID tokens não são aceitos como bearer tokens da API.
3. **Encontrar um contato**
   - Procure a segunda conta pelo ID público; verifique se o resultado do perfil não contém e-mail.
   - Envie uma solicitação de amizade, aceite-a como destinatário e confirme que as duas listas mostram o contato aceito.
   - Tente autoadição, ID inexistente e uma solicitação duplicada pendente/aceita; verifique que cada uma é rejeitada com feedback claro e sem registro duplicado.
4. **Validar mensagens diretas**
   - Crie/abra a conversa direta e troque texto e emojis.
   - Com os dois usuários conectados, verifique se a mensagem do segundo usuário aparece sem atualização da tela dentro da meta de 2 segundos da especificação em conectividade normal.
   - Desconecte o destinatário, envie uma mensagem, reconecte e verifique se a sincronização do histórico a restaura.
   - Simule um envio falho; verifique se a mensagem é marcada como não enviada e que uma tentativa com o mesmo client ID não duplica.
5. **Validar anexos e voz**
   - Envie arquivos JPEG, PNG, WebP, PDF, DOCX e TXT de até 25 MiB e uma nota de voz em WebM, Ogg ou MP4 suportada pelo navegador, de até 5 minutos/25 MiB.
   - Confirme que os destinatários só conseguem recuperar o conteúdo quando autorizados para a conversa.
   - Tente um formato não suportado, um arquivo acima de 25 MiB e uma voz além de qualquer limite; verifique a rejeição antes de uma mensagem bem-sucedida ser exibida, com os tipos e limites permitidos visíveis.
   - Desconecte ou interrompa um upload; verifique um erro recuperável e um caminho de retry.
6. **Validar grupos e autorização**
   - Crie um grupo com nome e contatos aceitos, adicione outro contato aceito e troque cada tipo de mensagem suportado.
   - Tente acessar grupo/histórico/upload como não membro; verifique que o acesso é negado.
   - Tente participantes duplicados e inexistentes; verifique que nenhuma associação duplicada é criada e que o usuário recebe feedback claro.
7. **Validar qualidade e acessibilidade**
   - Execute checagens estritas de TypeScript e lint usando os comandos documentados do app.
   - Conclua os fluxos de cadastro, contatos, mensagens, upload e grupos usando apenas teclado; confirme foco visível, rótulos e anúncios para status/erros.
   - Repita os fluxos centrais em larguras de mobile e desktop; verifique se o conteúdo reflow sem rolagem horizontal da página.
   - Compare o layout e as cores do chat desktop com a [referência Figma enviada](https://www.figma.com/make/hQBtdDBnOD3XzhcxaOevGj/Chat-App?p=f&t=PUMWhm1j6Oql3L2F-0), e confirme que sua visualização de conversa em dois painéis se adapta a um fluxo single-pane no mobile. Os controles de telefone/vídeo mostrados na maquete não são esperados para iniciar chamadas.

## Resultado esperado

Os cenários acima concluem sem vazamento de dados privados, mensagens ou memberships duplicados, acesso não autorizado à conversa ou falhas silenciosas. Meça o tempo de conclusão do cadastro/grupo e de busca/mensagens contra `SC-001` a `SC-006` em [spec.md](./spec.md); reporte qualquer resultado não medido durante a execução manual.
