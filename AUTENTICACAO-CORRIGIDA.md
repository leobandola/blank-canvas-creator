# Autenticação Corrigida

## Problema Resolvido

O sistema estava tentando usar o Supabase Auth automaticamente, causando erros de "invalid_credentials" e "refresh_token_not_found". 

## Solução Implementada

Desabilitamos completamente o Supabase Auth nos clientes (navegador e servidor) porque o sistema usa **autenticação customizada**:

- **Tabela customizada**: `admins` com email e password_hash
- **Gerenciamento de sessão**: Cookies HTTP-only (`admin_session`)
- **Supabase usado apenas para**: Banco de dados (queries), NÃO para autenticação

## Configurações Aplicadas

Em ambos `lib/supabase/client.ts` e `lib/supabase/server.ts`:

```typescript
auth: {
  persistSession: false,      // Não persiste sessões do Supabase Auth
  autoRefreshToken: false,     // Não tenta refresh automático
  detectSessionInUrl: false,   // Não detecta sessão na URL
}
```

## Como Funciona Agora

1. Login através do formulário → `signIn()` em `lib/auth.ts`
2. Verifica credenciais na tabela `admins` do banco
3. Cria cookie `admin_session` com dados do usuário
4. Supabase client usado APENAS para queries ao banco, não para auth

## Credenciais de Login

- **Email**: leolmo@gmail.com
- **Senha**: Sbh@3108#

O login deve funcionar normalmente agora sem erros de token.
