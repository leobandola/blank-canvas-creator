-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para verificação de login
DROP POLICY IF EXISTS "Allow read for login" ON admins;
CREATE POLICY "Allow read for login" ON admins FOR SELECT USING (true);

-- Política para permitir inserção de novos admins
DROP POLICY IF EXISTS "Allow insert for signup" ON admins;
CREATE POLICY "Allow insert for signup" ON admins FOR INSERT WITH CHECK (true);

-- Inserir o usuário existente
-- A senha Sbh@3108# será armazenada em texto simples por simplicidade
-- Em produção, use bcrypt ou similar
INSERT INTO admins (name, email, password_hash) 
VALUES ('Leonardo', 'leolmo@gmail.com', 'Sbh@3108#')
ON CONFLICT (email) DO UPDATE SET password_hash = 'Sbh@3108#';
