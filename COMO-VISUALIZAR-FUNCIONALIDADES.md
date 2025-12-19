# Como Visualizar as Funcionalidades Implementadas

## ⚠️ IMPORTANTE: As funcionalidades JÁ ESTÃO IMPLEMENTADAS!

Todos os recursos estão no código. Se você não está vendo, siga os passos abaixo.

## 🔧 Passos para Resolver

### 1. Limpar Cache e Recarregar (MAIS IMPORTANTE)

```bash
# No navegador, pressione:
Ctrl + Shift + R (Windows/Linux)
# ou
Cmd + Shift + R (Mac)
```

Alternativamente:
- Abra DevTools (F12)
- Clique com botão direito no ícone de atualizar
- Selecione "Limpar cache e fazer hard reload"

### 2. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C no terminal)
# Depois inicie novamente:
npm run dev
```

### 3. Verificar Login

As funcionalidades de edição SÓ aparecem quando você está logado!

**Credenciais:**
- Email: leolmo@gmail.com
- Senha: Sbh@3108#

## 📍 Onde Encontrar Cada Funcionalidade

### ✅ Campo "Valor da Aposta"

**Ao CRIAR uma nova rodada:**
1. Vá para a página "Rodadas"
2. Clique no botão laranja "Nova Rodada"
3. O campo "Valor da Aposta (R$)" está logo após "Tipo de Loteria"
4. Valor padrão: 5.00

**Ao EDITAR uma rodada existente:**
1. Vá para a página "Rodadas"
2. Clique no ícone de lápis (Edit) ao lado da rodada
3. O campo "Valor da Aposta (R$)" está após o tipo de loteria
4. Altere o valor e clique em "Atualizar"

### ✅ Botão "Desfazer Pagamento"

**Localização:**
1. Entre em uma rodada (clique no nome da rodada)
2. Na lista de apostas, procure apostas com badge verde "Pago - R$ XX.XX"
3. Ao lado direito de cada aposta paga, há 4 ícones:
   - ✏️ Lápis (Editar aposta)
   - ❌ Círculo amarelo com X (Desfazer pagamento) ← ESTE É O BOTÃO
   - 🗑️ Lixeira (Excluir aposta)

**IMPORTANTE:** O botão de desfazer SÓ APARECE em apostas que já foram pagas!

### ✅ Valor Correto nas Apostas

Quando você cria uma nova aposta, o sistema:
1. Busca automaticamente o `bet_value` da rodada
2. Aplica esse valor ao pagamento
3. Exibe "Pago - R$ XX.XX" quando você confirma o pagamento

**Se o valor ainda aparece errado:**
- As apostas antigas (criadas antes da alteração) mantêm o valor antigo
- Novas apostas usarão o novo valor
- Para atualizar apostas antigas, você precisa deletar e recriar

## 🐛 Ainda Não Funciona?

### Verifique no Console

1. Abra DevTools (F12)
2. Vá na aba "Console"
3. Procure por mensagens com `[v0]`
4. Me envie os erros se houver

### Verifique se a Coluna Existe no Banco

Execute no Supabase SQL Editor:

```sql
-- Verificar se a coluna bet_value existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'rounds' AND column_name = 'bet_value';

-- Se não retornar nada, execute:
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS bet_value NUMERIC DEFAULT 5.00;
UPDATE rounds SET bet_value = 5.00 WHERE bet_value IS NULL;
```

## 📝 Checklist de Verificação

- [ ] Fiz hard refresh (Ctrl+Shift+R)
- [ ] Reiniciei o servidor (npm run dev)
- [ ] Estou logado no sistema
- [ ] Estou olhando para uma aposta PAGA (não pendente)
- [ ] A rodada foi editada DEPOIS de limpar o cache

Se todos os itens estão marcados e ainda não funciona, tire um print da tela e me envie!
