-- Add payment_deadline and round_start_date columns to rounds table
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS round_start_date TIMESTAMPTZ;

-- Update existing rounds to have a payment deadline (3 days after start_date as default)
UPDATE rounds 
SET payment_deadline = start_date + INTERVAL '3 days'
WHERE payment_deadline IS NULL;

-- Update existing rounds to have round_start_date same as start_date
UPDATE rounds 
SET round_start_date = start_date
WHERE round_start_date IS NULL;
