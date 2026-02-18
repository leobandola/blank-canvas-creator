

## Plano: Migração para Vite + React Router com Melhorias

### Fase 1 — Infraestrutura (Migração para Vite)
- Criar `index.html`, `vite.config.ts` e configurar o projeto para React + Vite + TypeScript
- Adicionar script `build:dev` ao `package.json`
- Substituir o roteamento Next.js (`app/`) por **React Router** com rotas equivalentes
- Migrar o client Supabase para funcionar no browser (sem server components)
- Remover dependências de Next.js (`next`, `@vercel/analytics`, etc.)
- Remover CSS duplicado (`styles/globals.css`), manter apenas um arquivo global
- Remover lock file duplicado

### Fase 2 — Layout e Navegação Global
- Criar um **layout compartilhado** com sidebar ou top navigation bar
- Menu com links para: Início, Jogadores, Rodadas, Sorteios, Premiações, Backup
- Indicador visual da página ativa
- Botão de login/logout no header
- Design responsivo com menu hamburger no mobile

### Fase 3 — Correções de Bugs
- Corrigir scripts SQL: remover referências a tabelas inexistentes (`draw_results`, `accumulated_results`)
- Corrigir conflito de políticas RLS: garantir que as policies "Allow all" sejam removidas antes de criar as novas
- Adicionar **tratamento de erros visual** — mostrar mensagens amigáveis ao usuário em vez de tela vazia
- Adicionar **estados de loading** (skeletons/spinners) em todas as listas

### Fase 4 — Melhorias de UX
- **Dashboard na home**: cards com estatísticas (total de jogadores, rodadas ativas, sorteios realizados, prêmios distribuídos)
- **Toasts de feedback**: notificações visuais para ações como criar jogador, registrar aposta, salvar sorteio
- **Busca e filtros**: campo de busca nas listas de jogadores e rodadas
- **Confirmação de exclusão**: diálogos de confirmação antes de deletar registros
- **Melhoria mobile**: garantir que tabelas e formulários funcionem bem em telas pequenas

### Fase 5 — Autenticação (Adaptada para SPA)
- Migrar a autenticação de server actions para **Supabase Auth client-side**
- Manter páginas de login e signup
- Proteger rotas que exigem autenticação via React Router
- Mostrar/esconder botões de edição baseado no estado de autenticação

