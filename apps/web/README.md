# React + TypeScript + Vite

Este modelo fornece uma configuração mínima para deixar o React funcionando no Vite com HMR e algumas regras do Oxlint.

Atualmente, dois plugins oficiais estão disponíveis:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) usa [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) usa [SWC](https://swc.rs/)

## React Compiler

O React Compiler não está habilitado neste modelo devido ao impacto no desempenho de desenvolvimento e build. Para ativá-lo, consulte [esta documentação](https://react.dev/learn/react-compiler/installation).

## Expandindo a configuração do Oxlint

Se você estiver desenvolvendo uma aplicação de produção, recomendamos habilitar regras de lint com suporte a tipos instalando `oxlint-tsgolint` e editando `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

Consulte a [documentação de regras do Oxlint](https://oxc.rs/docs/guide/usage/linter/rules) para a lista completa de regras e categorias.