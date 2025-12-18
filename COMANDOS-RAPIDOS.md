# Comandos Rápidos para o aaPanel

## Deploy Completo
```bash
cd /www/wwwroot/myluck.primesollutions.com.br
chmod +x deploy.sh
./deploy.sh
```

## Verificar Status
```bash
# Ver se a aplicação está rodando
ps aux | grep "next start"

# Verificar porta 3004
netstat -tulpn | grep 3004

# Testar localmente
curl http://localhost:3004
```

## Logs
```bash
# Ver logs do Supervisor (aaPanel)
# Acesse: Supervisor > Service > loteria > Log

# Ver logs do Next.js
tail -f /www/wwwroot/myluck.primesollutions.com.br/.next/standalone/server.log
```

## Reiniciar Aplicação
```bash
# Pelo Supervisor do aaPanel
# Supervisor > Service > loteria > Restart

# Manualmente (se necessário)
pkill -f "next start"
cd /www/wwwroot/myluck.primesollutions.com.br
PORT=3004 npm start
```

## Resolver Problemas Comuns

### Erro 503
```bash
# Verificar se a aplicação está rodando
ps aux | grep node

# Se não estiver, iniciar pelo Supervisor
# Ou manualmente: PORT=3004 npm start
```

### Porta em uso
```bash
# Encontrar processo
lsof -i :3004

# Matar processo
kill -9 [PID]
```

### Build com erro
```bash
# Limpar e rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

## Configuração do Daemon no Supervisor

**Acesse:** aaPanel > Supervisor > Add Daemon

- **Name:** loteria
- **Run User:** root
- **Processes:** 1  
- **Start command:** \`bash /www/wwwroot/myluck.primesollutions.com.br/start-prod.sh\`
- **Process directory:** \`/www/wwwroot/myluck.primesollutions.com.br\`
- **Remark:** Sistema de Bolão

Clique em **Confirm**, depois clique em **Start**

## Proxy Reverso (Nginx)

**Acesse:** Website > myluck.primesollutions.com.br > Time adicionado > Proxy reverso

Clique em **Adiciona proxy reverso** e configure:

- **Nome do proxy:** loteria
- **Proxy Dir:** /
- **URL alvo:** http://localhost:3004
- **Domínio enviado:** localhost
- **Show Proxy Path:** ✅ Ativado
- **Ativar cache:** ❌ Desativado  
- **Recurso avançado:** ✅ Ativado

Clique em **Confirm**
```
