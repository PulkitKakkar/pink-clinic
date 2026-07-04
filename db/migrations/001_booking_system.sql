CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY,
  branch_id text NOT NULL,
  staff_id text NOT NULL,
  practitioner_name text NOT NULL,
  service_id text NOT NULL,
  treatment_name text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
  customer_name text NOT NULL,
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_updated_at timestamptz,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no-show')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS marketing_consent_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS bookings_starts_at_idx ON bookings (starts_at);
CREATE INDEX IF NOT EXISTS bookings_branch_starts_at_idx ON bookings (branch_id, starts_at);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_staff_no_overlap') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_staff_no_overlap
      EXCLUDE USING gist (staff_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
      WHERE (status = 'confirmed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS booking_notification_deliveries (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  appointment_starts_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, notification_type, appointment_starts_at)
);

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY,
  template_slug text NOT NULL,
  template_title text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consultations_created_at_idx ON consultations (created_at DESC);
CREATE INDEX IF NOT EXISTS consultations_template_slug_idx ON consultations (template_slug);
