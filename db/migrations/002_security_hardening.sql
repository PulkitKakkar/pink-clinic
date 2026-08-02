CREATE TABLE IF NOT EXISTS request_rate_limits (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0)
);

CREATE INDEX IF NOT EXISTS request_rate_limits_window_idx
  ON request_rate_limits (window_started_at);

