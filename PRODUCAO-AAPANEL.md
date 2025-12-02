# Guia Completo para Rodar em Produção no aaPanel

## Problema Atual
- Aplicação está rodando com `npm run dev` (modo desenvolvimento)
- Daemon "loteria" está falhando
- Nginx retorna erro 503

## Solução Passo a Passo

### 1. Preparar a Aplicação para Produção

\`\`\`bash
cd /www/wwwroot/myluck.primesollutions.com.br

# Parar qualquer processo rodando
pkill -f "npm run dev"
pkill -f "next dev"

# Instalar dependências
npm install --legacy-peer-deps

# Build para produção
npm run build
\`\`\`

### 2. Configurar o Daemon no Supervisor (aaPanel)

**IMPORTANTE: Use `npm start` não `npm run dev`**

No Supervisor do aaPanel, edite o daemon "loteria":

- **Nome**: loteria
- **Run User**: root
- **Processes**: 1
- **Start command**: `npm start`
- **Process directory**: `/www/wwwroot/myluck.primesollutions.com.br`
- **Remark**: Sistema de Bolão

**Variáveis de ambiente (adicione no arquivo .env):**
\`\`\`bash
PORT=3004
NODE_ENV=production
\`\`\`

### 3. Criar Script de Inicialização

Crie o arquivo `start.sh` na raiz do projeto:

\`\`\`bash
#!/bin/bash
cd /www/wwwroot/myluck.primesollutions.com.br
PORT=3004 NODE_ENV=production npm start
\`\`\`

Torne-o executável:
\`\`\`bash
chmod +x start.sh
\`\`\`

Depois atualize o daemon para usar: `./start.sh`

### 4. Configuração do Proxy Reverso (Nginx)

No aaPanel, em "Modificação do site > Proxy reverso":

- **Nome do proxy**: loteria
- **Proxy Dir**: /
- **URL alvo**: http://localhost:3004
- **Domínio enviado**: localhost
- **Show Proxy Path**: ✅ Ativado
- **Ativar cache**: ❌ Desativado
- **Recurso avançado**: ✅ Ativado

### 5. Iniciar a Aplicação

No Supervisor do aaPanel:
1. Clique em "Start" no daemon "loteria"
2. Verifique os logs clicando em "Log"
3. Aguarde alguns segundos para a aplicação iniciar

### 6. Verificar se Está Funcionando

\`\`\`bash
# Verificar se a aplicação está rodando
curl http://localhost:3004

# Verificar processos
ps aux | grep node

# Verificar portas
netstat -tulpn | grep 3004
\`\`\`

### 7. Solução de Problemas

**Se o daemon não iniciar:**

\`\`\`bash
# Verificar logs do daemon
tail -f /www/wwwroot/myluck.primesollutions.com.br/logs/error.log

# Tentar iniciar manualmente para ver erros
cd /www/wwwroot/myluck.primesollutions.com.br
PORT=3004 npm start
\`\`\`

**Se aparecer erro de porta em uso:**

\`\`\`bash
# Encontrar processo usando a porta 3004
lsof -i :3004

# Matar o processo
kill -9 [PID]
\`\`\`

**Se aparecer erro de build:**

\`\`\`bash
# Limpar cache e rebuild
rm -rf .next
npm run build
\`\`\`

### 8. Configuração de Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

\`\`\`env
# Porta da aplicação
PORT=3004

# Ambiente
NODE_ENV=production

# Supabase (já configuradas)
POSTGRES_URL=sua_url
SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key
# ... outras variáveis
\`\`\`

### 9. Reiniciar Nginx

Após configurar tudo:

\`\`\`bash
# No terminal do servidor
nginx -t  # Testar configuração
nginx -s reload  # Recarregar Nginx
\`\`\`

Ou no aaPanel:
- Website > myluck.primesollutions.com.br > Service > Restart

## Comandos Úteis

\`\`\`bash
# Ver logs da aplicação
tail -f /www/wwwroot/myluck.primesollutions.com.br/.next/standalone/logs/*

# Reiniciar aplicação
# No Supervisor: Click em "Restart" no daemon "loteria"

# Verificar status
curl https://myluck.primesollutions.com.br
\`\`\`

## Checklist Final

- [ ] Build concluído sem erros (`npm run build`)
- [ ] Daemon configurado para usar `npm start` (não `npm run dev`)
- [ ] Porta 3004 configurada no .env
- [ ] Proxy reverso apontando para localhost:3004
- [ ] Daemon "loteria" rodando (status: Running)
- [ ] Site acessível em https://myluck.primesollutions.com.br
- [ ] Todas as páginas carregando corretamente

## Estrutura Correta

\`\`\`
/www/wwwroot/myluck.primesollutions.com.br/
├── .next/                 # Build de produção
├── app/                   # Código fonte
├── components/           # Componentes
├── lib/                  # Bibliotecas
├── public/              # Arquivos públicos
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências
├── next.config.mjs      # Configuração Next.js
└── start.sh            # Script de inicialização
