-- Enable Supabase Auth
-- Criar política RLS para controle de acesso baseado em autenticação

-- Atualizar política de players para permitir leitura pública mas escrita apenas para autenticados
DROP POLICY IF EXISTS "Players are viewable by everyone" ON players;
DROP POLICY IF EXISTS "Players can be managed by authenticated users" ON players;

CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (true);

CREATE POLICY "Players can be managed by authenticated users" ON players
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de rounds
DROP POLICY IF EXISTS "Rounds are viewable by everyone" ON rounds;
DROP POLICY IF EXISTS "Rounds can be managed by authenticated users" ON rounds;

CREATE POLICY "Rounds are viewable by everyone" ON rounds
  FOR SELECT USING (true);

CREATE POLICY "Rounds can be managed by authenticated users" ON rounds
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de bets
DROP POLICY IF EXISTS "Bets are viewable by everyone" ON bets;
DROP POLICY IF EXISTS "Bets can be managed by authenticated users" ON bets;

CREATE POLICY "Bets are viewable by everyone" ON bets
  FOR SELECT USING (true);

CREATE POLICY "Bets can be managed by authenticated users" ON bets
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de payments
DROP POLICY IF EXISTS "Payments are viewable by everyone" ON payments;
DROP POLICY IF EXISTS "Payments can be managed by authenticated users" ON payments;

CREATE POLICY "Payments are viewable by everyone" ON payments
  FOR SELECT USING (true);

CREATE POLICY "Payments can be managed by authenticated users" ON payments
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de draws
DROP POLICY IF EXISTS "Draws are viewable by everyone" ON draws;
DROP POLICY IF EXISTS "Draws can be managed by authenticated users" ON draws;

CREATE POLICY "Draws are viewable by everyone" ON draws
  FOR SELECT USING (true);

CREATE POLICY "Draws can be managed by authenticated users" ON draws
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de draw_results
DROP POLICY IF EXISTS "Draw results are viewable by everyone" ON draw_results;
DROP POLICY IF EXISTS "Draw results can be managed by authenticated users" ON draw_results;

CREATE POLICY "Draw results are viewable by everyone" ON draw_results
  FOR SELECT USING (true);

CREATE POLICY "Draw results can be managed by authenticated users" ON draw_results
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de accumulated_results
DROP POLICY IF EXISTS "Accumulated results are viewable by everyone" ON accumulated_results;
DROP POLICY IF EXISTS "Accumulated results can be managed by authenticated users" ON accumulated_results;

CREATE POLICY "Accumulated results are viewable by everyone" ON accumulated_results
  FOR SELECT USING (true);

CREATE POLICY "Accumulated results can be managed by authenticated users" ON accumulated_results
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Atualizar política de winners
DROP POLICY IF EXISTS "Winners are viewable by everyone" ON winners;
DROP POLICY IF EXISTS "Winners can be managed by authenticated users" ON winners;

CREATE POLICY "Winners are viewable by everyone" ON winners
  FOR SELECT USING (true);

CREATE POLICY "Winners can be managed by authenticated users" ON winners
  FOR ALL USING (auth.uid() IS NOT NULL);
