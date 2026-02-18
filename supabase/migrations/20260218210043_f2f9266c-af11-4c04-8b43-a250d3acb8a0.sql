
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can manage roles
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Drop all existing permissive policies
DROP POLICY IF EXISTS "Allow all on players" ON public.players;
DROP POLICY IF EXISTS "Allow all on rounds" ON public.rounds;
DROP POLICY IF EXISTS "Allow all on bets" ON public.bets;
DROP POLICY IF EXISTS "Allow all on payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all on draws" ON public.draws;
DROP POLICY IF EXISTS "Allow all on results" ON public.results;
DROP POLICY IF EXISTS "Allow all on winners" ON public.winners;

DROP POLICY IF EXISTS "Anyone can view players" ON public.players;
DROP POLICY IF EXISTS "Anyone can view rounds" ON public.rounds;
DROP POLICY IF EXISTS "Anyone can view bets" ON public.bets;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can view draws" ON public.draws;
DROP POLICY IF EXISTS "Anyone can view results" ON public.results;
DROP POLICY IF EXISTS "Anyone can view winners" ON public.winners;

DROP POLICY IF EXISTS "Authenticated users can insert players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can update players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can delete players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can insert rounds" ON public.rounds;
DROP POLICY IF EXISTS "Authenticated users can update rounds" ON public.rounds;
DROP POLICY IF EXISTS "Authenticated users can delete rounds" ON public.rounds;
DROP POLICY IF EXISTS "Authenticated users can insert bets" ON public.bets;
DROP POLICY IF EXISTS "Authenticated users can update bets" ON public.bets;
DROP POLICY IF EXISTS "Authenticated users can delete bets" ON public.bets;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can insert draws" ON public.draws;
DROP POLICY IF EXISTS "Authenticated users can update draws" ON public.draws;
DROP POLICY IF EXISTS "Authenticated users can delete draws" ON public.draws;
DROP POLICY IF EXISTS "Authenticated users can insert results" ON public.results;
DROP POLICY IF EXISTS "Authenticated users can update results" ON public.results;
DROP POLICY IF EXISTS "Authenticated users can delete results" ON public.results;
DROP POLICY IF EXISTS "Authenticated users can insert winners" ON public.winners;
DROP POLICY IF EXISTS "Authenticated users can update winners" ON public.winners;
DROP POLICY IF EXISTS "Authenticated users can delete winners" ON public.winners;

-- NEW POLICIES: Authenticated users can read, only admins can write

-- PLAYERS: auth read (has PII), admin write
CREATE POLICY "Auth users can view players" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update players" ON public.players FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete players" ON public.players FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ROUNDS: public read (no PII), admin write
CREATE POLICY "Anyone can view rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Admins can insert rounds" ON public.rounds FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update rounds" ON public.rounds FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete rounds" ON public.rounds FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- BETS: auth read (has player data), admin write
CREATE POLICY "Auth users can view bets" ON public.bets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert bets" ON public.bets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bets" ON public.bets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bets" ON public.bets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- PAYMENTS: auth read (sensitive financial), admin write
CREATE POLICY "Auth users can view payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- DRAWS: public read (lottery results are public), admin write
CREATE POLICY "Anyone can view draws" ON public.draws FOR SELECT USING (true);
CREATE POLICY "Admins can insert draws" ON public.draws FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update draws" ON public.draws FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete draws" ON public.draws FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RESULTS: public read (game results), admin write
CREATE POLICY "Anyone can view results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Admins can insert results" ON public.results FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update results" ON public.results FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete results" ON public.results FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- WINNERS: public read (prize announcements), admin write
CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Admins can insert winners" ON public.winners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update winners" ON public.winners FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete winners" ON public.winners FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
