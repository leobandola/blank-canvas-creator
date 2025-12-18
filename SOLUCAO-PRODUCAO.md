# Solução para Problemas de Produção no aaPanel

## Problema 1: Porta em Uso

Se aparecer erro `EADDRINUSE: address already in use :::3000`:

```bash
# Matar processo na porta 3000
chmod +x kill-port.sh
./kill-port.sh 3000

# Ou manualmente
lsof -ti:3000 | xargs kill -9
```

## Problema 2: Iniciar na Porta 3004

```bash
# Método 1: Variável de ambiente
PORT=3004 npm start

# Método 2: Script permanente
npm start -- -p 3004
```

## Configuração no Supervisor (aaPanel)

**Nome do daemon:** loteria

**Comando de start:**
```
npm start -- -p 3004
```

**Diretório do processo:**
```
/www/wwwroot/myluck.primesollutions.com.br
```

**Usuário:** root (ou seu usuário)

**Processos:** 1

**Prioridade de inicialização:** 999

## Verificar se está rodando

```bash
# Ver logs
tail -f /root/.pm2/logs/loteria-out.log
tail -f /root/.pm2/logs/loteria-error.log

# Testar localmente
curl http://localhost:3004

# Ver processos
lsof -i:3004
```

## Nginx - Configuração do Proxy Reverso

No aaPanel, em "Proxy reverso" do site:

**URL alvo:** `http://localhost:3004`
**Domínio enviado:** `localhost`

Salve e reinicie o Nginx.

## Comandos Úteis

```bash
# Build
npm run build

# Iniciar
PORT=3004 npm start

# Verificar logs do Next.js
journalctl -u loteria -f

# Reiniciar daemon
# No painel do Supervisor, clique em "Restart"
