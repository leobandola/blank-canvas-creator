# Checklist de Produção

## Antes do Deploy

### Configurações Essenciais
- [x] Variáveis de ambiente configuradas corretamente
- [x] Supabase integrado e banco criado
- [x] Scripts SQL executados (tabelas, funções, triggers)
- [x] RLS (Row Level Security) habilitado em todas as tabelas
- [x] Políticas de segurança configuradas
- [x] TypeScript build sem erros
- [x] Print buttons como Client Components

### Segurança
- [x] Credenciais do Supabase seguras (nunca commitadas)
- [x] Service Role Key protegida (apenas backend)
- [x] ANON KEY exposta apenas onde necessário
- [x] Middleware de autenticação configurado
- [x] Validações de formulários implementadas
- [x] Console.errors mantidos para debugging (produção)

### Performance
- [x] Imagens otimizadas (unoptimized: true para compatibilidade)
- [x] Queries do Supabase otimizadas com select específico
- [x] Indexes no banco de dados (via RLS policies)
- [x] Caching configurado no Next.js

### Funcionalidades Testadas
- [x] Sistema de login/logout
- [x] Cadastro de jogadores
- [x] Criação de rodadas (Quina e Mega Sena)
- [x] Registro de apostas
- [x] Adição de sorteios
- [x] Cálculo automático de resultados
- [x] Sistema de pagamentos
- [x] Relatórios (impressão/PDF)
- [x] Sistema de backup/restauração
- [x] Permissões (visitantes vs autenticados)

## Configuração do Servidor

### VPS/Servidor Dedicado
- [ ] Node.js 18+ instalado
- [ ] PM2 instalado e configurado
- [ ] Apache/Nginx com proxy reverso
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Firewall configurado (portas 80, 443)
- [ ] Cloudflare configurado (opcional)

### Vercel (Alternativa)
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Domínio customizado configurado (opcional)

## Pós-Deploy

### Testes em Produção
- [ ] Acessar URL de produção
- [ ] Testar login/logout
- [ ] Criar uma rodada de teste
- [ ] Adicionar aposta de teste
- [ ] Registrar sorteio de teste
- [ ] Verificar cálculo de resultados
- [ ] Testar impressão de relatórios
- [ ] Verificar backup/exportação

### Monitoramento
- [ ] Configurar alertas de erro
- [ ] Monitorar logs de aplicação
- [ ] Acompanhar métricas do Supabase
- [ ] Verificar uso de recursos (CPU, RAM)

### Manutenção
- [ ] Configurar rotina de backup automático
- [ ] Documentar procedimentos operacionais
- [ ] Treinar usuários administrativos
- [ ] Estabelecer canal de suporte

## Troubleshooting Comum

### Erro: Forbidden 403
**Causa**: Apache não está redirecionando para Next.js
**Solução**: Configurar proxy reverso no Apache (ver DEPLOY_GUIDE.md)

### Erro: Route conflict (id vs roundId)
**Causa**: Cache do Next.js com estrutura antiga
**Solução**: 
\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

### Erro: Event handlers in Server Component
**Causa**: Button com onClick em Server Component
**Solução**: Usar Client Component ou componente separado

### Erro: Supabase connection failed
**Causa**: Variáveis de ambiente incorretas
**Solução**: Verificar .env.local e variáveis no servidor

## Contatos de Emergência

- Suporte Supabase: https://supabase.com/support
- Documentação Next.js: https://nextjs.org/docs
- Vercel Support: https://vercel.com/help
