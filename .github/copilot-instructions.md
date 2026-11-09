# Convencoes do projeto

## Git e commits

- Ao concluir uma tarefa de implementacao solicitada, crie um commit com apenas as alteracoes relacionadas a ela e envie-o ao remote configurado quando a autenticacao estiver disponivel.
- Use Conventional Commits com tipo em ingles e descricao em portugues: `tipo(escopo opcional): descricao`.
- Use tipos como `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore` e `perf`.
- Escreva a descricao em portugues, no imperativo, iniciando em minusculas e sem ponto final. Exemplo: `feat(auth): adiciona login com provedores sociais`.
- Mantenha cada commit pequeno, coerente e revisavel. Nao inclua alteracoes alheias a tarefa nem arquivos com segredos.
- Use branches descritivas no formato `tipo/descricao-curta`; prefira branches de trabalho e pull requests em vez de alterar diretamente a branch principal.
- Antes de enviar alteracoes, verifique a branch, o diff e o estado do repositorio. Nunca reescreva historico compartilhado sem autorizacao.
- Se nao houver remote ou autenticacao, nao simule o envio: informe o bloqueio e deixe claro o que falta.
