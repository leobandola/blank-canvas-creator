
-- Drop ALL existing restrictive policies and recreate as permissive

-- BETS
DROP POLICY IF EXISTS "Auth users can view bets" ON public.bets;
DROP POLICY IF EXISTS "Admins can insert bets" ON public.bets;
DROP POLICY IF EXISTS "Admins can update bets" ON public.bets;
DROP POLICY IF EXISTS "Admins can delete bets" ON public.bets;

CREATE POLICY "Auth users can view bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Admins can insert bets" ON public.bets FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update bets" ON public.bets FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete bets" ON public.bets FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- DRAWS
DROP POLICY IF EXISTS "Anyone can view draws" ON public.draws;
DROP POLICY IF EXISTS "Admins can insert draws" ON public.draws;
DROP POLICY IF EXISTS "Admins can update draws" ON public.draws;
DROP POLICY IF EXISTS "Admins can delete draws" ON public.draws;

CREATE POLICY "Anyone can view draws" ON public.draws FOR SELECT USING (true);
CREATE POLICY "Admins can insert draws" ON public.draws FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update draws" ON public.draws FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete draws" ON public.draws FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- PAYMENTS
DROP POLICY IF EXISTS "Auth users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

CREATE POLICY "Auth users can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Admins can insert payments" ON public.payments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- PLAYERS
DROP POLICY IF EXISTS "Auth users can view players" ON public.players;
DROP POLICY IF EXISTS "Admins can insert players" ON public.players;
DROP POLICY IF EXISTS "Admins can update players" ON public.players;
DROP POLICY IF EXISTS "Admins can delete players" ON public.players;

CREATE POLICY "Auth users can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Admins can insert players" ON public.players FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update players" ON public.players FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete players" ON public.players FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RESULTS
DROP POLICY IF EXISTS "Anyone can view results" ON public.results;
DROP POLICY IF EXISTS "Admins can insert results" ON public.results;
DROP POLICY IF EXISTS "Admins can update results" ON public.results;
DROP POLICY IF EXISTS "Admins can delete results" ON public.results;

CREATE POLICY "Anyone can view results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Admins can insert results" ON public.results FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update results" ON public.results FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete results" ON public.results FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ROUNDS
DROP POLICY IF EXISTS "Anyone can view rounds" ON public.rounds;
DROP POLICY IF EXISTS "Admins can insert rounds" ON public.rounds;
DROP POLICY IF EXISTS "Admins can update rounds" ON public.rounds;
DROP POLICY IF EXISTS "Admins can delete rounds" ON public.rounds;

CREATE POLICY "Anyone can view rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Admins can insert rounds" ON public.rounds FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update rounds" ON public.rounds FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete rounds" ON public.rounds FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- USER_ROLES
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- WINNERS
DROP POLICY IF EXISTS "Anyone can view winners" ON public.winners;
DROP POLICY IF EXISTS "Admins can insert winners" ON public.winners;
DROP POLICY IF EXISTS "Admins can update winners" ON public.winners;
DROP POLICY IF EXISTS "Admins can delete winners" ON public.winners;

CREATE POLICY "Anyone can view winners" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Admins can insert winners" ON public.winners FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update winners" ON public.winners FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete winners" ON public.winners FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
