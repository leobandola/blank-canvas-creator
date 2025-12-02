# Guia de Configuração aaPanel

## Problema: Páginas 404 no aaPanel

### Causa
O Next.js precisa rodar como aplicação Node.js, não como arquivos estáticos HTML.

### Solução Completa

## 1. Instalar Node.js no aaPanel

\`\`\`bash
# Conectar via SSH
ssh root@seu-servidor

# Instalar Node.js 18+ (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
\`\`\`

## 2. Configurar PM2 (Gerenciador de Processos)

\`\`\`bash
# Instalar PM2 globalmente
npm install -g pm2

# Ir para o diretório do projeto
cd /www/wwwroot/myluck.primesollutions.com.br

# Instalar dependências
npm install --legacy-peer-deps

# Build da aplicação
npm run build

# Iniciar com PM2
pm2 start npm --name "myluck" -- start

# Salvar configuração do PM2
pm2 save
pm2 startup

# Ver logs
pm2 logs myluck
\`\`\`

## 3. Configurar Nginx no aaPanel

No painel aaPanel:

1. Vá em **Sites** → **myluck.primesollutions.com.br** → **Configurações**
2. Clique em **Configuração** (arquivo nginx)
3. Substitua o conteúdo por:

\`\`\`nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name myluck.primesollutions.com.br;
    
    # Certificados SSL (ajuste o caminho se necessário)
    ssl_certificate /www/server/panel/vhost/cert/myluck.primesollutions.com.br/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/myluck.primesollutions.com.br/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Logs
    access_log /www/wwwlogs/myluck.primesollutions.com.br.log;
    error_log /www/wwwlogs/myluck.primesollutions.com.br.error.log;
    
    # Proxy para Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Assets estáticos do Next.js
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static {
        proxy_cache STATIC;
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name myluck.primesollutions.com.br;
    return 301 https://$server_name$request_uri;
}
\`\`\`

4. Clique em **Salvar**
5. Reinicie o Nginx: `systemctl restart nginx` ou pelo painel aaPanel

## 4. Verificar se está Funcionando

\`\`\`bash
# Ver processos PM2
pm2 list

# Ver logs em tempo real
pm2 logs myluck --lines 50

# Testar se o Next.js está respondendo
curl http://localhost:3000

# Verificar se o Nginx está rodando
systemctl status nginx
\`\`\`

## 5. Comandos Úteis

\`\`\`bash
# Reiniciar aplicação
pm2 restart myluck

# Parar aplicação
pm2 stop myluck

# Ver uso de recursos
pm2 monit

# Atualizar código e reiniciar
cd /www/wwwroot/myluck.primesollutions.com.br
git pull  # se usar git
npm install --legacy-peer-deps
npm run build
pm2 restart myluck

# Limpar cache e rebuild completo
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
pm2 restart myluck
\`\`\`

## 6. Troubleshooting

### Erro: Porta 3000 já em uso
\`\`\`bash
# Ver o que está usando a porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3001 pm2 start npm --name "myluck" -- start
# E ajustar no nginx: proxy_pass http://127.0.0.1:3001;
\`\`\`

### Erro: Permissões
\`\`\`bash
# Ajustar proprietário dos arquivos
chown -R www:www /www/wwwroot/myluck.primesollutions.com.br
\`\`\`

### Páginas ainda dão 404
\`\`\`bash
# Limpar cache do navegador (Ctrl+Shift+Delete)
# Reiniciar tudo
pm2 restart myluck
systemctl restart nginx

# Verificar logs
pm2 logs myluck
tail -f /www/wwwlogs/myluck.primesollutions.com.br.error.log
\`\`\`

### Build falha
\`\`\`bash
# Ver erro completo
npm run build 2>&1 | tee build.log

# Comum: falta de memória
# Aumentar memória do Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build
\`\`\`

## 7. Variáveis de Ambiente

Certifique-se de que as variáveis de ambiente do Supabase estão configuradas:

\`\`\`bash
# Criar arquivo .env.local
nano /www/wwwroot/myluck.primesollutions.com.br/.env.local
\`\`\`

Cole suas variáveis:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
# ... outras variáveis
\`\`\`

Depois reinicie:
\`\`\`bash
pm2 restart myluck
\`\`\`

## 8. Monitoramento

Configure o PM2 para reiniciar automaticamente em caso de crash ou reboot:

\`\`\`bash
# Iniciar no boot
pm2 startup
pm2 save

# Monitorar em tempo real
pm2 monit
\`\`\`

---

## Checklist Final

- [ ] Node.js 18+ instalado
- [ ] PM2 instalado globalmente
- [ ] Dependências instaladas (`npm install`)
- [ ] Build feito com sucesso (`npm run build`)
- [ ] Aplicação rodando no PM2 (`pm2 list`)
- [ ] Nginx configurado corretamente
- [ ] Nginx reiniciado
- [ ] Variáveis de ambiente configuradas
- [ ] Porta 3000 acessível internamente (`curl localhost:3000`)
- [ ] Site acessível externamente
- [ ] PM2 configurado para iniciar no boot

Se seguir todos esses passos, sua aplicação deve funcionar perfeitamente no aaPanel!
