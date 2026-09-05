CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  entity text NOT NULL,
  entity_id text NOT NULL,
  summary text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor text NOT NULL DEFAULT 'Admin portal',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx
  ON admin_activity_log (created_at DESC);
