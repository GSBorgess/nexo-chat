---
description: "Modelo de lista de tarefas para implementação da funcionalidade"
---

# Tarefas: [NOME DA FUNCIONALIDADE]

**Entrada**: documentos de design de 

**Pré-requisitos**: plan.md (obrigatório), spec.md (obrigatório para histórias de usuário), research.md, data-model.md, contracts/

**Testes**: os exemplos abaixo incluem tarefas de teste. Testes são OPCIONAIS - incluir apenas se forem explicitamente solicitados na especificação da funcionalidade.

**Organização**: as tarefas são agrupadas por história de usuário para permitir implementação e teste independentes de cada história.

## Formato: 

- **[P]**: pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: a qual história de usuário esta tarefa pertence (por exemplo, US1, US2, US3)
- incluir caminhos exatos de arquivos nas descrições

## Convenções de Caminho

- **Projeto único**: ,  na raiz do repositório
- **Aplicativo web**: , 
- **Mobile**: ,  ou 
- os caminhos mostrados abaixo assumem um projeto único - ajuste conforme a estrutura de plan.md

<!--
  ============================================================================
  IMPORTANTE: as tarefas abaixo são EXEMPLOS de tarefas apenas para ilustração.

  O comando /speckit-tasks DEVE substituir essas tarefas por tarefas reais com base em:
  - histórias de usuário de spec.md (com suas prioridades P1, P2, P3...)
  - requisitos da funcionalidade de plan.md
  - entidades de data-model.md
  - endpoints de contracts/

  As tarefas DEVEM ser organizadas por história de usuário para que cada história possa ser:
  - implementada independentemente
  - testada independentemente
  - entregue como incremento MVP

  NÃO manter estas tarefas de exemplo no arquivo tasks.md gerado.
  ============================================================================
-->

## Fase 1: Configuração (Infraestrutura Compartilhada)

**Objetivo**: inicialização do projeto e estrutura básica

- [ ] T001 Criar a estrutura do projeto conforme o plano de implementação
- [ ] T002 Inicializar o projeto [linguagem] com dependências de [framework]
- [ ] T003 [P] Configurar ferramentas de lint e formatação

---

## Fase 2: Base (Pré-requisitos Bloqueantes)

**Objetivo**: infraestrutura central que DEVE estar concluída antes de QUALQUER história de usuário poder ser implementada

**⚠️ CRÍTICO**: nenhuma tarefa de história de usuário pode começar até esta fase ser concluída

Exemplos de tarefas fundamentais (ajustar conforme o projeto):

- [ ] T004 Configurar schema do banco e framework de migrações
- [ ] T005 [P] Implementar framework de autenticação/autorização
- [ ] T006 [P] Configurar estrutura de roteamento e middleware da API
- [ ] T007 Criar modelos/entidades base dos quais todas as histórias dependem
- [ ] T008 Configurar infraestrutura de tratamento de erros e logs
- [ ] T009 Configurar gerenciamento de variáveis de ambiente

**Checkpoint**: base pronta - a implementação das histórias de usuário pode começar em paralelo

---

## Fase 3: História de Usuário 1 - [Título] (Prioridade: P1) 🎯 MVP

**Objetivo**: [descrição breve do que esta história entrega]

**Teste Independente**: [como verificar se esta história funciona por si só]

### Testes para a História de Usuário 1 (OPCIONAL - apenas se os testes forem solicitados) ⚠️

> **OBSERVAÇÃO: escrever estes testes PRIMEIRO, garantir que FALHEM antes da implementação**

- [ ] T010 [P] [US1] Teste de contrato para [endpoint] em tests/contract/test_[name].py
- [ ] T011 [P] [US1] Teste de integração para [jornada do usuário] em tests/integration/test_[name].py

### Implementação para a História de Usuário 1

- [ ] T012 [P] [US1] Criar o modelo [Entity1] em src/models/[entity1].py
- [ ] T013 [P] [US1] Criar o modelo [Entity2] em src/models/[entity2].py
- [ ] T014 [US1] Implementar [Service] em src/services/[service].py (depende de T012, T013)
- [ ] T015 [US1] Implementar [endpoint/feature] em src/[location]/[file].py
- [ ] T016 [US1] Adicionar validação e tratamento de erros
- [ ] T017 [US1] Adicionar logs para operações da história de usuário 1

**Checkpoint**: neste ponto, a História de Usuário 1 deve estar totalmente funcional e testável de forma independente

---

## Fase 4: História de Usuário 2 - [Título] (Prioridade: P2)

**Objetivo**: [descrição breve do que esta história entrega]

**Teste Independente**: [como verificar se esta história funciona por si só]

### Testes para a História de Usuário 2 (OPCIONAL - apenas se os testes forem solicitados) ⚠️

- [ ] T018 [P] [US2] Teste de contrato para [endpoint] em tests/contract/test_[name].py
- [ ] T019 [P] [US2] Teste de integração para [jornada do usuário] em tests/integration/test_[name].py

### Implementação para a História de Usuário 2

- [ ] T020 [P] [US2] Criar o modelo [Entity] em src/models/[entity].py
- [ ] T021 [US2] Implementar [Service] em src/services/[service].py
- [ ] T022 [US2] Implementar [endpoint/feature] em src/[location]/[file].py
- [ ] T023 [US2] Integrar com componentes da História de Usuário 1 (se necessário)

**Checkpoint**: neste ponto, as histórias de usuário 1 e 2 devem funcionar independentemente

---

## Fase 5: História de Usuário 3 - [Título] (Prioridade: P3)

**Objetivo**: [descrição breve do que esta história entrega]

**Teste Independente**: [como verificar se esta história funciona por si só]

### Testes para a História de Usuário 3 (OPCIONAL - apenas se os testes forem solicitados) ⚠️

- [ ] T024 [P] [US3] Teste de contrato para [endpoint] em tests/contract/test_[name].py
- [ ] T025 [P] [US3] Teste de integração para [jornada do usuário] em tests/integration/test_[name].py

### Implementação para a História de Usuário 3

- [ ] T026 [P] [US3] Criar o modelo [Entity] em src/models/[entity].py
- [ ] T027 [US3] Implementar [Service] em src/services/[service].py
- [ ] T028 [US3] Implementar [endpoint/feature] em src/[location]/[file].py

**Checkpoint**: todas as histórias de usuário devem estar funcionalmente independentes agora

---

[Adicionar mais fases de histórias de usuário conforme necessário, seguindo o mesmo padrão]

---

## Fase N: Polimento e preocupações transversais

**Objetivo**: melhorias que afetam múltiplas histórias de usuário

- [ ] TXXX [P] Atualizações de documentação em docs/
- [ ] TXXX Limpeza e refatoração de código
- [ ] TXXX Otimização de desempenho em todas as histórias
- [ ] TXXX [P] Testes unitários adicionais (se solicitados) em tests/unit/
- [ ] TXXX Fortalecimento de segurança
- [ ] TXXX Executar validação do quickstart.md

---

## Dependências e Ordem de Execução

### Dependências da Fase

- **Configuração (Fase 1)**: sem dependências - pode começar imediatamente
- **Base (Fase 2)**: depende da conclusão da configuração - BLOQUEIA todas as histórias de usuário
- **Histórias de Usuário (Fase 3+)**: todas dependem da conclusão da fase base
  - as histórias de usuário podem então prosseguir em paralelo (se houver equipe)
  - ou sequencialmente em ordem de prioridade (P1 → P2 → P3)
- **Polimento (Fase Final)**: depende de todas as histórias desejadas estarem concluídas

### Dependências das Histórias de Usuário

- **História de Usuário 1 (P1)**: pode começar após a Base (Fase 2) - sem dependências em outras histórias
- **História de Usuário 2 (P2)**: pode começar após a Base (Fase 2) - pode integrar com US1, mas deve ser testável independentemente
- **História de Usuário 3 (P3)**: pode começar após a Base (Fase 2) - pode integrar com US1/US2, mas deve ser testável independentemente

### Dentro de Cada História de Usuário

- testes (se incluídos) DEVEM ser escritos e FALHAR antes da implementação
- modelos antes de serviços
- serviços antes de endpoints
- implementação central antes da integração
- história concluída antes de avançar para a próxima prioridade

### Oportunidades de Paralelismo

- todas as tarefas de configuração marcadas com [P] podem ser executadas em paralelo
- todas as tarefas de base marcadas com [P] podem ser executadas em paralelo (dentro da Fase 2)
- uma vez concluída a fase base, todas as histórias de usuário podem começar em paralelo (se houver capacidade da equipe)
- todos os testes de uma história de usuário marcados com [P] podem ser executados em paralelo
- modelos dentro de uma história marcados com [P] podem ser executados em paralelo
- diferentes histórias de usuário podem ser trabalhadas em paralelo por diferentes membros da equipe

---

## Exemplo de Paralelismo: História de Usuário 1



---

## Estratégia de Implementação

### MVP Primeiro (somente História de Usuário 1)

1. Concluir Fase 1: Configuração
2. Concluir Fase 2: Base (CRÍTICO - bloqueia todas as histórias)
3. Concluir Fase 3: História de Usuário 1
4. **PARAR E VALIDAR**: testar a História de Usuário 1 de forma independente
5. Implantar/demonstrar se estiver pronto

### Entrega Incremental

1. Concluir configuração + base → base pronta
2. Adicionar História de Usuário 1 → testar independentemente → implantar/demonstrar (MVP!)
3. Adicionar História de Usuário 2 → testar independentemente → implantar/demonstrar
4. Adicionar História de Usuário 3 → testar independentemente → implantar/demonstrar
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
