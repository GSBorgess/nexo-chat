# Constituição do Nexo Chat

## Princípios Fundamentais

### I. Valor do Usuário e Comportamento Claro
Toda funcionalidade DEVE atender a uma necessidade declarada do usuário e possuir critérios de aceitação observáveis. O comportamento voltado ao usuário, incluindo erros e estados vazios, DEVE ser compreensível e consistente em toda a aplicação. Isso mantém o desenvolvimento focado em resultados que os usuários podem verificar.

### II. Design Manutenível e Arquitetura Limpa
O código DEVE seguir a estrutura de **Arquitetura Limpa (Clean Architecture / Feature-First)**, separando de forma modular as camadas de apresentação, regras de negócio/domínio e infraestrutura. O backend DEVE funcionar como uma API/servidor dedicado, enquanto o frontend lida exclusivamente com a interface e o estado local. Novas abstrações e dependências DEVEM ser justificadas por requisitos concretos, mantendo o comportamento coeso e organizado.

### III. Verificação de Código e Qualidade Sem Testes
Conforme diretriz do projeto, **testes unitários e automações de teste não são exigidos nem serão implementados**, priorizando a agilidade e a validação de fluxo via interface. A qualidade do código DEVE ser garantida através de **tipagem estrita (TypeScript)**, checagens de lint e validações manuais antes da conclusão de qualquer funcionalidade.

### IV. Privacidade e Segurança por Design (Zero Exposição)
As funcionalidades DEVEM coletar e expor apenas os dados necessários para a sua finalidade declarada. **Nenhuma chave de API, string de conexão ou segredo pode ser exposto no código-fonte em hipótese alguma.** Todas as credenciais sensíveis DEVEM ser injetadas exclusivamente via variáveis de ambiente (`.env`) e validadas na inicialização. No frontend, nenhuma chave privada ou administrativa pode ser exposta. Senhas DEVEM ser processadas somente pelo Auth0; a aplicação não deve armazená-las. Tokens de acesso DEVEM ser validados e protegidos, nunca registrados ou expostos em respostas.

Para autenticação, o projeto DEVE usar Auth0 como provedor de identidade, com login por e-mail e Google habilitado como conexão do tenant Auth0.

### V. Experiência Acessível e Resiliente
Interfaces voltadas ao usuário DEVEM suportar operação por teclado, fornecer rótulos e feedbacks de status significativos, e preservar layouts utilizáveis em todos os tamanhos de tela suportados. Erros inesperados não devem quebrar a aplicação (crash); operações assíncronas ou falhas DEVEM apresentar um resultado recuperável ou uma mensagem amigável e clara em vez de parecerem silenciosamente bem-sucedidas.

## Restrições Adicionais

A implementação DEVE usar a stack tecnológica estabelecida do projeto e as convenções documentadas. Auth0 é o serviço de identidade aprovado para este projeto; a conexão Google deve ser configurada no tenant Auth0, sem credenciais Google no cliente ou na API. O armazenamento privado compatível com S3 é aprovado para os anexos e mensagens de voz exigidos pelo produto. Qualquer outra dependência de runtime ou serviço externo DEVE ter necessidade declarada e impactos operacionais, de privacidade e manutenção considerados antes da adoção. A retenção e o tratamento de dados DEVEM ser limitados ao que a funcionalidade exige.

## Fluxo de Trabalho de Desenvolvimento

Antes da implementação, as mudanças DEVEM ser verificadas em relação aos requisitos relevantes e à arquitetura existente. O autor DEVE executar as checagens de tipo e qualidade aplicáveis, revisar o diff resultante para evitar mudanças não intencionais e relatar qualquer comportamento não verificado. Mudanças que alterem o comportamento visível ao usuário ou dados persistidos DEVEM documentar o impacto e quaisquer etapas de migração ou rollout necessárias.

## Governança

Esta constituição rege as especificações de funcionalidades, planos de implementação, mudanças de código e revisões. Emendas DEVEM declarar sua justificativa e impacto nos princípios e trabalhos existentes; mudanças que afetem a compatibilidade DEVEM incluir uma abordagem de migração. Os mantenedores do projeto aprovam as emendas.

A emenda 1.2.0 estabelece Auth0 como provedor de identidade obrigatório e aprova armazenamento privado compatível com S3 para os anexos já exigidos pelo produto. Ela substitui a intenção anterior de autenticação local/sessões próprias sem alterar os requisitos de privacidade; variáveis de configuração e credenciais do tenant devem ser provisionadas antes do login em cada ambiente.

A constituição usa versionamento semântico: MAJOR para mudanças incompatíveis de governança ou princípios, MINOR para novos princípios ou requisitos materialmente expandidos, e PATCH para esclarecimentos e correções não semânticas. Toda emenda DEVE atualizar a versão e a data da última alteração.

Cada revisão de mudança DEVE avaliar os princípios aplicáveis. Qualquer desvio DEVE ser explícito, justificado e aprovado pelo mantenedor do projeto.

**Versão**: 1.2.0 | **Ratificado**: 2026-10-28 | **Última Alteração**: 2026-11-06