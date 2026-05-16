-- Domain ownership verification table
-- Users must verify they own a domain before scanning it (legal requirement)

CREATE TABLE IF NOT EXISTS domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, domain),
  UNIQUE(verification_token)
);

CREATE INDEX IF NOT EXISTS idx_domain_verif_user ON domain_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_verif_status ON domain_verifications(status);
CREATE INDEX IF NOT EXISTS idx_domain_verif_domain ON domain_verifications(domain);
