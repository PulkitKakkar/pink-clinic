ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_postcode text NOT NULL DEFAULT '';
