-- Adicionar campo bet_value na tabela rounds
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS bet_value NUMERIC DEFAULT 5.00;

-- Atualizar rodadas existentes com valor padrão
UPDATE rounds SET bet_value = 5.00 WHERE bet_value IS NULL;
