
-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds table
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lottery_type TEXT NOT NULL CHECK (lottery_type IN ('quina', 'mega_sena')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  payment_deadline TIMESTAMPTZ,
  round_start_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, player_id)
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draws table
CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  draw_number INTEGER NOT NULL,
  draw_date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, draw_number)
);

-- Results table
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  matches_count INTEGER NOT NULL DEFAULT 0,
  matched_numbers INTEGER[] NOT NULL DEFAULT '{}',
  accumulated_matches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bet_id, draw_id)
);

-- Winners table
CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  bet_id UUID NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('main', 'second_place', 'zero_hits', 'daily_bonus')),
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  prize_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bets_round_id ON public.bets(round_id);
CREATE INDEX idx_bets_player_id ON public.bets(player_id);
CREATE INDEX idx_payments_bet_id ON public.payments(bet_id);
CREATE INDEX idx_draws_round_id ON public.draws(round_id);
CREATE INDEX idx_results_bet_id ON public.results(bet_id);
CREATE INDEX idx_results_draw_id ON public.results(draw_id);
CREATE INDEX idx_winners_round_id ON public.winners(round_id);
CREATE INDEX idx_winners_player_id ON public.winners(player_id);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (visitors can view)
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can view rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can view bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can view draws" ON public.draws FOR SELECT USING (true);
CREATE POLICY "Anyone can view results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update players" ON public.players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete players" ON public.players FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert rounds" ON public.rounds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rounds" ON public.rounds FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete rounds" ON public.rounds FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert bets" ON public.bets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bets" ON public.bets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete bets" ON public.bets FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update payments" ON public.payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete payments" ON public.payments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert draws" ON public.draws FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update draws" ON public.draws FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete draws" ON public.draws FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert results" ON public.results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update results" ON public.results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete results" ON public.results FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert winners" ON public.winners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update winners" ON public.winners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete winners" ON public.winners FOR DELETE TO authenticated USING (true);

-- Function to calculate matches
CREATE OR REPLACE FUNCTION public.calculate_matches(
  bet_numbers INTEGER[],
  draw_numbers INTEGER[]
)
RETURNS TABLE (
  matches_count INTEGER,
  matched_numbers INTEGER[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched INTEGER[];
BEGIN
  SELECT ARRAY(
    SELECT UNNEST(bet_numbers)
    INTERSECT
    SELECT UNNEST(draw_numbers)
  ) INTO matched;
  
  RETURN QUERY SELECT COALESCE(array_length(matched, 1), 0)::INTEGER, COALESCE(matched, '{}'::INTEGER[]);
END;
$$;

-- Function to update accumulated matches
CREATE OR REPLACE FUNCTION public.update_accumulated_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accumulated INTEGER;
BEGIN
  SELECT COALESCE(SUM(matches_count), 0)
  INTO accumulated
  FROM results
  WHERE bet_id = NEW.bet_id
  AND draw_id IN (
    SELECT id FROM draws
    WHERE round_id = (SELECT round_id FROM bets WHERE id = NEW.bet_id)
    AND draw_number <= (SELECT draw_number FROM draws WHERE id = NEW.draw_id)
  );
  
  NEW.accumulated_matches := accumulated;
  RETURN NEW;
END;
$$;

-- Trigger for accumulated matches
CREATE TRIGGER trigger_update_accumulated_matches
BEFORE INSERT OR UPDATE ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.update_accumulated_matches();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_round_leaderboard(round_uuid UUID)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  accumulated_matches BIGINT,
  total_draws INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as player_id,
    p.name as player_name,
    COALESCE(SUM(r.matches_count), 0) as accumulated_matches,
    COUNT(DISTINCT r.draw_id)::INTEGER as total_draws
  FROM players p
  INNER JOIN bets b ON b.player_id = p.id
  LEFT JOIN results r ON r.bet_id = b.id
  WHERE b.round_id = round_uuid
  GROUP BY p.id, p.name
  ORDER BY accumulated_matches DESC;
END;
$$;
