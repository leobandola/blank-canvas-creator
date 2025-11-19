-- Adiciona campos de configuração de prêmios na tabela rounds

-- Adicionar colunas para valores de premiação
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS prize_10_hits DECIMAL(10, 2);
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS prize_2nd_place DECIMAL(10, 2);
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS prize_zero_hits DECIMAL(10, 2);
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS prize_per_draw DECIMAL(10, 2);
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS prize_indication DECIMAL(10, 2);
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS total_prize_pool DECIMAL(10, 2);

-- Comentários explicativos
COMMENT ON COLUMN rounds.prize_10_hits IS 'Prêmio para quem acertar 10 números';
COMMENT ON COLUMN rounds.prize_2nd_place IS 'Prêmio para segunda colocação';
COMMENT ON COLUMN rounds.prize_zero_hits IS 'Prêmio para zero acertos';
COMMENT ON COLUMN rounds.prize_per_draw IS 'Prêmio por acertos em cada sorteio';
COMMENT ON COLUMN rounds.prize_indication IS 'Prêmio por indicação';
COMMENT ON COLUMN rounds.total_prize_pool IS 'Total da premiação distribuída';
