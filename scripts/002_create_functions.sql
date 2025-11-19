-- Function to calculate matches for a bet against a draw
CREATE OR REPLACE FUNCTION calculate_matches(
  bet_numbers INTEGER[],
  draw_numbers INTEGER[]
)
RETURNS TABLE (
  matches_count INTEGER,
  matched_numbers INTEGER[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  matched INTEGER[];
BEGIN
  -- Find intersection of arrays
  SELECT ARRAY(
    SELECT UNNEST(bet_numbers)
    INTERSECT
    SELECT UNNEST(draw_numbers)
  ) INTO matched;
  
  RETURN QUERY SELECT array_length(matched, 1), matched;
END;
$$;

-- Function to update accumulated matches
CREATE OR REPLACE FUNCTION update_accumulated_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  accumulated INTEGER;
BEGIN
  -- Calculate accumulated matches for this bet up to and including this draw
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

-- Trigger to automatically update accumulated matches
CREATE TRIGGER trigger_update_accumulated_matches
BEFORE INSERT OR UPDATE ON results
FOR EACH ROW
EXECUTE FUNCTION update_accumulated_matches();

-- Function to get leaderboard for a round
CREATE OR REPLACE FUNCTION get_round_leaderboard(round_uuid UUID)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  accumulated_matches BIGINT,
  total_draws INTEGER
)
LANGUAGE plpgsql
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
