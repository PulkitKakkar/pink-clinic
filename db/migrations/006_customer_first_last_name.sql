ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_last_name text NOT NULL DEFAULT '';

UPDATE bookings
SET
  customer_first_name = split_part(trim(customer_name), ' ', 1),
  customer_last_name = trim(substr(trim(customer_name), length(split_part(trim(customer_name), ' ', 1)) + 1))
WHERE customer_first_name = '' AND customer_last_name = '';
