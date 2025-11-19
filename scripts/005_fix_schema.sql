-- Fix email to be optional
ALTER TABLE players ALTER COLUMN email DROP NOT NULL;

-- Remove unique constraint on bets to allow multiple bets per player per round
ALTER TABLE bets DROP CONSTRAINT IF EXISTS bets_round_id_player_id_key;

-- Add payment deadline and start date to rounds
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS payment_deadline DATE;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS round_start_date DATE;
