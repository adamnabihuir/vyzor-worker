-- Vyzor: Deep Scan jobs table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scans (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  domain          TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'queued',   -- queued | running | completed | failed
  progress        INTEGER     NOT NULL DEFAULT 0,          -- 0-100
  current_step    TEXT        NOT NULL DEFAULT 'Queued...',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  -- Results (written by worker)
  subdomains      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ports           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  findings        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  stats           JSONB       NOT NULL DEFAULT '{}'::jsonb,
  error_message   TEXT
);

-- Index for worker polling (queued scans, ordered by arrival)
CREATE INDEX IF NOT EXISTS idx_scans_status_created ON scans (status, created_at);

-- Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Anyone can READ a scan by its UUID (UUID is 128-bit — functionally unguessable)
CREATE POLICY "Public read by id" ON scans
  FOR SELECT USING (true);

-- Only the service role (worker + server-side API) can write
CREATE POLICY "Service role write" ON scans
  FOR ALL TO service_role USING (true) WITH CHECK (true);
