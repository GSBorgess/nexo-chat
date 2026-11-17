---
applyTo: "apps/web/src/**/*.{tsx,css}"
---

# Direção visual do Nexo Chat

Use como referência visual principal o design do Figma:
https://www.figma.com/make/hQBtdDBnOD3XzhcxaOevGj/Chat-App?t=2irJR5x6cvKoTB77-1

Mantenha a linguagem visual da referência ao criar ou alterar páginas e
componentes do frontend:

- Prefira superfícies claras, bastante espaço, bordas suaves e acento roxo.
- Em telas largas, mantenha o painel lateral de conversas à esquerda e a
  conversa selecionada à direita. O painel deve ocupar aproximadamente 35% da
  largura, com largura mínima suficiente para a lista.
- No painel lateral, preserve a hierarquia de marca, stories, busca, filtros,
  lista de mensagens e navegação inferior.
- Na conversa, preserve o cabeçalho com avatar e presença, o histórico ocupando
  o espaço disponível e o compositor ancorado na base.
- Diferencie mensagens recebidas em balões claros alinhados à esquerda e
  mensagens enviadas em roxo alinhadas à direita; mantenha horário e estado de
  entrega legíveis.
- Reutilize os tokens e estilos globais de
  `apps/web/src/styles/globals.css`, incluindo tipografia Geist, superfícies
  claras e roxo da marca. Evite introduzir paletas ou estilos paralelos sem
  necessidade.
- Em telas estreitas, use navegação single-pane: mostre a lista ou a conversa,
  com uma ação clara para voltar à lista. Evite rolagem horizontal e preserve o
  uso em larguras a partir de 320 px.
- Mantenha foco de teclado visível, nomes acessíveis em controles de ícone e
  estados desabilitados para ações ainda não implementadas.
- Trate textos e imagens da referência como conteúdo visual de exemplo. Use
  dados reais nas integrações do produto e não apresente ações sem
  funcionalidade como se estivessem disponíveis.

Ao alterar o layout, verifique a composição em desktop e em tela estreita e
preserve a hierarquia visual e o comportamento responsivo descritos acima.
