-- Create tables for lottery pool management system

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds table (rodadas)
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lottery_type TEXT NOT NULL CHECK (lottery_type IN ('quina', 'mega_sena')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bets table (apostas dos jogadores)
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, player_id)
);

-- Payments table (pagamentos)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draws table (sorteios realizados)
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  draw_number INTEGER NOT NULL,
  draw_date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, draw_number)
);

-- Results table (resultados acumulados por jogador)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  matches_count INTEGER NOT NULL DEFAULT 0,
  matched_numbers INTEGER[] NOT NULL DEFAULT '{}',
  accumulated_matches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bet_id, draw_id)
);

-- Winners table (vencedores por categoria)
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('main', 'second_place', 'zero_hits', 'daily_bonus')),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  prize_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bets_round_id ON bets(round_id);
CREATE INDEX idx_bets_player_id ON bets(player_id);
CREATE INDEX idx_payments_bet_id ON payments(bet_id);
CREATE INDEX idx_draws_round_id ON draws(round_id);
CREATE INDEX idx_results_bet_id ON results(bet_id);
CREATE INDEX idx_results_draw_id ON results(draw_id);
CREATE INDEX idx_winners_round_id ON winners(round_id);
CREATE INDEX idx_winners_player_id ON winners(player_id);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- For now, allowing all operations for simplicity
-- You can add auth.uid() checks if you implement user authentication

CREATE POLICY "Allow all on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on rounds" ON rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bets" ON bets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on draws" ON draws FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on results" ON results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on winners" ON winners FOR ALL USING (true) WITH CHECK (true);
