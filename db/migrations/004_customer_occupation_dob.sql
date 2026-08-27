ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_occupation text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_date_of_birth date;
