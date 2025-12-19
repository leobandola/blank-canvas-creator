# Instruções para Debug do Sistema

## Problema Atual
O sistema mostra valor de R$ 5,00 mesmo depois de alterar para R$ 20,00 na rodada.

## Como Debugar

### 1. Limpar Cache do Navegador
```bash
# Chrome/Edge/Brave
Ctrl + Shift + Delete
# Ou
Ctrl + Shift + R (Hard Refresh)
```

### 2. Reiniciar o Servidor
```bash
# Parar o servidor (Ctrl + C)
# Iniciar novamente
npm run dev
```

### 3. Verificar Logs no Console

Abra o Console do Navegador (F12) e procure por mensagens `[v0]`:

**Ao abrir o diálogo de Nova Aposta:**
```
[v0] CreateBetDialog opened, fetching bet_value for round: xxx
[v0] Round data fetched: { bet_value: 20 }
[v0] Setting betValue to: 20
```

**Ao criar uma aposta:**
```
[v0] Creating bet with payment amount: 20
[v0] Bet created successfully, creating payment with amount: 20
[v0] Payment created successfully with amount: 20
```

### 4. Verificar no Banco de Dados

Execute no Supabase SQL Editor:
```sql
-- Ver valor configurado nas rodadas
SELECT id, name, bet_value FROM rounds ORDER BY created_at DESC LIMIT 5;

-- Ver valores dos pagamentos recentes
SELECT p.amount, p.status, b.round_id, r.name 
FROM payments p
JOIN bets b ON b.id = p.bet_id
JOIN rounds r ON r.id = b.round_id
ORDER BY p.created_at DESC
LIMIT 10;
```

### 5. Testar Fluxo Completo

1. **Editar Rodada** - Verifique se o campo "Valor da Aposta (R$)" aparece
2. **Alterar para R$ 20,00** - Salvar
3. **Abrir Console** (F12) 
4. **Criar Nova Aposta** - Ver logs `[v0]` mostrando valor 20
5. **Verificar Badge** - Deve mostrar "R$ 20,00 por aposta"

### 6. Funcionalidades Implementadas

✅ **Campo de Valor da Aposta:**
- Aparece em "Criar Rodada" 
- Aparece em "Editar Rodada"

✅ **Uso do Valor:**
- CreateBetDialog busca dinamicamente ao abrir
- CopyBetsDialog busca dinamicamente ao abrir
- Badge na página da rodada mostra o valor

✅ **Botão Desfazer Pagamento:**
- Aparece apenas em apostas PAGAS
- Ícone amarelo XCircle ao lado do botão de editar
- Só visível para usuários autenticados

## Checklist de Verificação

- [ ] Hard refresh no navegador (Ctrl+Shift+R)
- [ ] Servidor reiniciado
- [ ] Usuário está logado
- [ ] Console aberto para ver logs
- [ ] Campo bet_value aparece ao editar rodada
- [ ] Badge mostra valor correto na página da rodada
- [ ] Logs mostram valor correto ao criar aposta
- [ ] Pagamentos são criados com valor correto
