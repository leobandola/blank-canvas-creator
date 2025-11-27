# Guia de Deploy - Sistema de Bolão

## Requisitos

- Node.js 18 ou superior
- npm ou yarn
- PM2 (para gerenciamento de processos)

## Passos para Deploy no aaPanel

### 1. Fazer o Build da Aplicação

\`\`\`bash
cd /www/wwwroot/myluck.primesollutions.com.br
npm install --legacy-peer-deps
npm run build
\`\`\`

### 2. Configurar PM2

Crie um arquivo `ecosystem.config.js` na raiz do projeto:

\`\`\`javascript
module.exports = {
  apps: [{
    name: 'lottery-system',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/www/wwwroot/myluck.primesollutions.com.br',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
\`\`\`

### 3. Iniciar com PM2

\`\`\`bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

### 4. Configurar Nginx (aaPanel)

No aaPanel, vá em **Website** > **Seu Site** > **Config** e adicione:

\`\`\`nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /_next/static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 1y;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
}

location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
\`\`\`

### 5. Verificar se está Rodando

\`\`\`bash
pm2 status
pm2 logs lottery-system
\`\`\`

### 6. Comandos Úteis

\`\`\`bash
# Reiniciar aplicação
pm2 restart lottery-system

# Ver logs em tempo real
pm2 logs lottery-system --lines 100

# Parar aplicação
pm2 stop lottery-system

# Remover aplicação
pm2 delete lottery-system
\`\`\`

## Variáveis de Ambiente

Certifique-se de que todas as variáveis de ambiente do Supabase estão configuradas corretamente no servidor:

- POSTGRES_URL
- POSTGRES_PRISMA_URL
- SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Troubleshooting

### Erro 404 em todas as páginas

**Causa:** Next.js não está rodando ou Nginx não está configurado corretamente.

**Solução:**
1. Verifique se o Next.js está rodando: `pm2 status`
2. Verifique os logs: `pm2 logs lottery-system`
3. Teste diretamente: `curl http://localhost:3000`
4. Verifique a configuração do Nginx

### Build falha

**Causa:** Dependências ou erros TypeScript.

**Solução:**
1. Limpe cache: `rm -rf .next node_modules package-lock.json`
2. Reinstale: `npm install --legacy-peer-deps`
3. Tente build novamente: `npm run build`

### Páginas carregam mas não funcionam

**Causa:** Variáveis de ambiente faltando.

**Solução:**
1. Verifique `.env` ou configure no aaPanel
2. Reinicie: `pm2 restart lottery-system`
