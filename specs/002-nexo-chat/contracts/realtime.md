# Contrato de Tempo Real

## Conexão

- **Endpoint**: `wss://<api-origin>/api/realtime`
- **Autenticação**: após a upgrade, o primeiro frame do cliente DEVE ser `auth.authenticate` com um access token do Auth0 para a audience da API; nenhuma subscription ou outro frame do cliente é aceito antes da verificação bem-sucedida. Rejeitar/encerrar conexões não autenticadas e aplicar um prazo curto de autenticação. Nunca colocar tokens na URL do WebSocket nem registrá-los. Validar o handshake `Origin` contra a lista de origens permitidas do frontend configurada; cabeçalhos CORS sozinhos não protegem upgrades do WebSocket.
- **Função do transporte**: notificações em tempo real do servidor para o cliente. Os clientes criam mensagens por meio do endpoint HTTP persistente em [openapi.yaml](./openapi.yaml); o servidor confirma antes de acionar o acknowledge e a transmissão.
- **Reconexão**: reconectar e autenticar com um access token atual do Auth0, depois buscar mensagens perdidas usando `GET /api/conversations/{conversationId}/messages` e seu cursor. Uma conexão WebSocket não é um armazenamento de mensagens.

## Frames do cliente

Frames são objetos JSON com os campos `type` e `data`.

### `auth.authenticate`

```json
{
  "type": "auth.authenticate",
  "data": { "accessToken": "<Auth0 access token para a audience da API>" }
}
```

O servidor valida a assinatura, o issuer e a audience do token usando o Auth0 JWKS. Em caso de sucesso, envia `auth.authenticated`; em caso de falha, envia um frame `error` e fecha a conexão.

### `auth.authenticated`

```json
{
  "type": "auth.authenticated",
  "data": { "sub": "Auth0 subject verificado" }
}
```

### `conversation.subscribe`

```json
{
  "type": "conversation.subscribe",
  "data": { "conversationId": "UUID" }
}
```

O servidor verifica o membership atual antes de inscrever a conexão. Um cliente não pode se inscrever na conversa de outro usuário ou em uma conversa de não membro.

### `conversation.unsubscribe`

```json
{
  "type": "conversation.unsubscribe",
  "data": { "conversationId": "UUID" }
}
```

## Frames do servidor

### `message.created`

Transmitir apenas para membros conectados após a confirmação da transação da mensagem.

```json
{
  "type": "message.created",
  "data": {
    "id": "UUID",
    "conversationId": "UUID",
    "author": { "publicId": "ID público com 12 caracteres", "displayName": "Nome" },
    "clientMessageId": "UUID",
    "kind": "TEXT",
    "text": "Olá",
    "attachmentId": null,
    "createdAt": "timestamp ISO-8601"
  }
}
```

`kind` é `TEXT`, `AUDIO` ou `FILE`; emojis de texto são Unicode comum. Mensagens de anexo incluem um `attachmentId` e a recuperação autorizada usa o endpoint HTTP de download.

### `error`

```json
{
  "type": "error",
  "data": { "code": "FORBIDDEN", "message": "Você não pode acessar esta conversa." }
}
```

Fechar ou ignorar frames inválidos conforme a política do servidor; não devolver IDs internos, e-mails, dados de sessão ou credenciais de armazenamento em frames de erro.

## Entrega e estado do cliente

- Um `POST` HTTP bem-sucedido de mensagem significa que ela foi armazenada de forma durável; o cliente pode limpar seu estado pendente.
- Uma requisição HTTP falha permanece visivelmente falha e pode ser repetida com o mesmo `clientMessageId`.
- Retentativas duplicadas retornam a mensagem já persistida e não criam uma segunda mensagem.
- Notificações WebSocket são best-effort. O cliente marca o status de conectividade e ressincroniza o histórico após a reconexão.
- Toda subscription e transmissão de mensagem são restritas aos membros atuais da conversa.
