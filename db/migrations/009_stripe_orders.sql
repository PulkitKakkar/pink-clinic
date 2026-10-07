CREATE TABLE IF NOT EXISTS payment_orders (
  session_id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_key text;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_stripe_payment_key_idx
  ON bookings (stripe_payment_key) WHERE stripe_payment_key IS NOT NULL;
