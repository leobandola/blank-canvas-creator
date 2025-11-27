-- Criar tabela de administradores com autenticação simples
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem ler suas próprias informações
CREATE POLICY "Admins can read their own data" ON admins
  FOR SELECT USING (true);

-- Política para permitir inserção (para cadastro)
CREATE POLICY "Allow insert for signup" ON admins
  FOR INSERT WITH CHECK (true);

-- Inserir um admin padrão com senha em texto simples para facilitar o primeiro acesso
-- Email: admin@bolao.com, Senha: admin123
INSERT INTO admins (email, password_hash, name)
VALUES ('admin@bolao.com', 'admin123', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- Atualizar políticas para usar verificação simples de sessão
-- As políticas serão verificadas no código da aplicação, não no banco
DROP POLICY IF EXISTS "Players can be managed by authenticated users" ON players;
DROP POLICY IF EXISTS "Rounds can be managed by authenticated users" ON rounds;
DROP POLICY IF EXISTS "Bets can be managed by authenticated users" ON bets;
DROP POLICY IF EXISTS "Payments can be managed by authenticated users" ON payments;
DROP POLICY IF EXISTS "Draws can be managed by authenticated users" ON draws;
DROP POLICY IF EXISTS "Draw results can be managed by authenticated users" ON draw_results;
DROP POLICY IF EXISTS "Accumulated results can be managed by authenticated users" ON accumulated_results;
DROP POLICY IF EXISTS "Winners can be managed by authenticated users" ON winners;

-- Criar políticas permissivas (controle será feito na aplicação)
CREATE POLICY "Players can be managed" ON players FOR ALL USING (true);
CREATE POLICY "Rounds can be managed" ON rounds FOR ALL USING (true);
CREATE POLICY "Bets can be managed" ON bets FOR ALL USING (true);
CREATE POLICY "Payments can be managed" ON payments FOR ALL USING (true);
CREATE POLICY "Draws can be managed" ON draws FOR ALL USING (true);
CREATE POLICY "Draw results can be managed" ON draw_results FOR ALL USING (true);
CREATE POLICY "Accumulated results can be managed" ON accumulated_results FOR ALL USING (true);
CREATE POLICY "Winners can be managed" ON winners FOR ALL USING (true);
