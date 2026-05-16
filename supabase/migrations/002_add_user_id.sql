-- Add user_id column to scans table
ALTER TABLE scans ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS scans_user_id_idx ON scans (user_id);
