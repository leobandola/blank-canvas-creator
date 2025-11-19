# Sistema de Gestão de Bolões

Sistema completo para gerenciamento de bolões de loteria (Quina e Mega Sena), desenvolvido com Next.js 16, React 19, Supabase e Tailwind CSS.

## Funcionalidades

### Gerenciamento de Jogadores
- Cadastro completo de jogadores com nome, email e telefone
- Listagem e busca de jogadores
- Edição e exclusão de jogadores

### Gerenciamento de Rodadas
- Criação de rodadas para Quina (1-80) ou Mega Sena (1-60)
- Status de rodadas (Ativa/Finalizada)
- Definição de datas de início, fim e prazo de pagamento
- **Configuração de valores de premiação por rodada**
- Visualização detalhada de cada rodada

### Sistema de Apostas
- Registro de apostas com seleção de números
- Controle de pagamentos (Pendente/Pago)
- **Opção de cancelar confirmação de pagamento**
- Visualização de apostas por rodada e por jogador
- **Exibição de datas de início e limite de pagamento**
- Edição de apostas antes dos sorteios

### Sorteios e Resultados
- Registro de resultados de sorteios
- Cálculo automático de acertos
- Acumulação de acertos por aposta
- Conferência de números sorteados
- **Relatório visual de distribuição de acertos**

### Sistema de Premiações
Implementa as seguintes regras automáticas:
- **Prêmio Principal (10 acertos)**: Primeiro a completar 10 acertos acumulativos
- **2ª Colocação**: Maior número de acertos (9, 8, 7...)
- **Prêmio Zero Acerto**: Quem não acertou nenhum número
- **Bônus Diário**: Mais acertos no sorteio do dia (primeiros 7 sorteios)
- **Prêmio Indicação**: Configurável por rodada

Valores de premiação configuráveis:
- Prêmio 10 acertos (principal)
- Prêmio 2ª colocação
- Prêmio zero acertos ou menos
- Prêmio por acertos em cada sorteio
- Prêmio indicação
- Total da premiação distribuída

### Relatórios
- **Relatório de Distribuição de Acertos**: Tabela mostrando quantos jogos têm cada quantidade de acertos
- Relatório de pagamentos por rodada (para impressão/PDF)
- Relatório de fechamento de rodada com resultados
- Ranking de apostas por rodada
- Histórico completo de sorteios
- **Todos os relatórios exibem datas de início e limite de pagamento**

### Sistema de Backup
- Exportação completa de dados em JSON
- Importação de backups anteriores
- Proteção de dados com confirmação

### Autenticação
- Sistema de login/cadastro com Supabase Auth
- Controle de acesso por usuário
- Middleware de autenticação
- Visitantes podem visualizar, apenas usuários autenticados podem editar

## Tecnologias Utilizadas

- **Framework**: Next.js 16.0.3 (App Router com Turbopack)
- **React**: 19.2.0 com Server Components
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Validação**: Zod + React Hook Form
- **Ícones**: Lucide React
- **TypeScript**: 5.x

## Estrutura do Projeto

\`\`\`
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/
│   │   └── signup/
│   ├── backup/              # Sistema de backup
│   ├── draws/               # Sorteios
│   │   └── [roundId]/
│   │       ├── page.tsx           # Lista de sorteios
│   │       ├── statistics/        # Relatório de distribuição de acertos
│   │       └── results/[drawId]/  # Resultados detalhados
│   ├── players/             # Jogadores
│   ├── prizes/              # Premiações
│   ├── rounds/              # Rodadas
│   │   └── [id]/           # Detalhes da rodada
│   │       ├── closure/    # Relatório de fechamento
│   │       └── report/     # Relatório de pagamentos
│   ├── layout.tsx
│   └── page.tsx
├── components/              # Componentes React
│   ├── ui/                 # Componentes shadcn/ui
│   └── ...                 # Componentes da aplicação
├── lib/                     # Utilitários e configurações
│   ├── auth.ts             # Funções de autenticação
│   ├── supabase/           # Clientes Supabase
│   ├── types.ts            # Definições TypeScript
│   └── utils.ts            # Funções utilitárias
├── scripts/                 # Scripts SQL do banco
│   ├── 001_create_tables.sql
│   ├── 002_create_functions.sql
│   ├── 003_seed_sample_data.sql
│   ├── 004_add_payment_deadline.sql
│   └── 005_add_prize_configuration.sql
└── middleware.ts            # Middleware de autenticação
\`\`\`

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- npm ou yarn

### Passo 1: Clone o repositório
\`\`\`bash
git clone <repository-url>
cd lottery-pool-management
\`\`\`

### Passo 2: Instale as dependências
\`\`\`bash
npm install
\`\`\`

### Passo 3: Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais do Supabase:

\`\`\`bash
cp .env.example .env.local
\`\`\`

### Passo 4: Configure o banco de dados
Execute os scripts SQL no Supabase SQL Editor na seguinte ordem:
1. `scripts/001_create_tables.sql` - Cria as tabelas
2. `scripts/002_create_functions.sql` - Cria funções e triggers
3. `scripts/003_seed_sample_data.sql` - Dados de exemplo (opcional)
4. `scripts/004_add_payment_deadline.sql` - Adiciona campos de datas
5. `scripts/005_add_prize_configuration.sql` - Adiciona campos de premiação

### Passo 5: Execute o projeto
\`\`\`bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
\`\`\`

O projeto estará disponível em `http://localhost:3000`

## Deploy em Produção

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push

### Servidor VPS com Apache/Nginx
1. Build da aplicação:
\`\`\`bash
npm run build
\`\`\`

2. Configure PM2 para manter o app rodando:
\`\`\`bash
npm install -g pm2
pm2 start npm --name "lottery-pool" -- start
pm2 save
pm2 startup
\`\`\`

3. Configure proxy reverso (Apache/Nginx) para a porta 3000

Consulte o arquivo `DEPLOY_GUIDE.md` para instruções detalhadas.

## Segurança

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado com políticas adequadas para proteger os dados.

### Autenticação
- Senhas criptografadas pelo Supabase Auth
- Tokens JWT para sessões
- Refresh tokens automático via middleware
- Proteção de rotas sensíveis

### Validações
- Validação de formulários com Zod
- Sanitização de inputs
- Verificação de permissões no servidor

## Estrutura do Banco de Dados

### Tabelas Principais
- `players` - Jogadores cadastrados
- `rounds` - Rodadas de apostas (com campos de premiação)
- `bets` - Apostas dos jogadores
- `draws` - Sorteios realizados
- `results` - Resultados de cada aposta por sorteio
- `payments` - Controle de pagamentos
- `winners` - Vencedores e premiações

### Funções e Triggers
- `update_accumulated_matches()` - Calcula acertos acumulados automaticamente
- `calculate_matches()` - Calcula acertos de uma aposta
- `get_round_leaderboard()` - Retorna ranking de uma rodada

## Scripts Disponíveis

\`\`\`bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm start            # Inicia servidor de produção
npm run lint         # Executa linter
npm run clean        # Limpa cache do Next.js
\`\`\`

## Suporte e Manutenção

### Backup Regular
Recomendamos fazer backup dos dados semanalmente através do sistema de backup integrado ou diretamente no Supabase.

### Monitoramento
- Logs do Next.js disponíveis no servidor
- Dashboard do Supabase para monitorar banco de dados
- Vercel Analytics (se hospedado na Vercel)

## Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

## Contato

Para suporte ou dúvidas, entre em contato através do sistema de suporte.
