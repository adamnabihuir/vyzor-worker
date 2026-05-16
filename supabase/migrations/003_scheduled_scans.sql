CREATE TABLE IF NOT EXISTS scheduled_scans (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT        NOT NULL,
  domain       TEXT        NOT NULL,
  frequency    TEXT        NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  next_run     TIMESTAMPTZ NOT NULL,
  active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scheduled_scans_user_idx ON scheduled_scans (user_id);
CREATE INDEX IF NOT EXISTS scheduled_scans_next_run_idx ON scheduled_scans (next_run) WHERE active = TRUE;
