CREATE TABLE IF NOT EXISTS marketing_sms_campaigns (
  id uuid PRIMARY KEY,
  message text NOT NULL,
  status text NOT NULL CHECK (status IN ('sending', 'completed')),
  selected_count integer NOT NULL,
  sent_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS marketing_sms_deliveries (
  id uuid PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES marketing_sms_campaigns(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
  error_message text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketing_sms_campaigns_created_at_idx
  ON marketing_sms_campaigns (created_at DESC);
CREATE INDEX IF NOT EXISTS marketing_sms_deliveries_campaign_id_idx
  ON marketing_sms_deliveries (campaign_id);
