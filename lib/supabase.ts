import { createClient } from '@supabase/supabase-js';

export type ScanRow = {
  id: string;
  domain: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  subdomains: string[];
  ports: PortResult[];
  findings: DeepFinding[];
  stats: ScanStats;
  error_message: string | null;
};

export type PortResult = {
  host: string;
  ip: string;
  port: number;
  protocol: string;
  service: string;
  product: string;
  version: string;
};

export type DeepFinding = {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  asset: string;
  port?: number;
  cve?: string;
  cvss?: number;
  description: string;
  remediation: string;
  source: 'nmap' | 'nuclei';
  template?: string;
  matched_at?: string;
};

export type ScanStats = {
  assetsDiscovered: number;
  portsScanned: number;
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
  riskScore: number;
};

// Server-side client (uses service role key — never expose to browser)
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}
