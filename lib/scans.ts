export interface ScanResult {
  id: string;
  domain: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  stats: {
    assetsDiscovered: number;
    portsScanned: number;
    vulnerabilities: { critical: number; high: number; medium: number; low: number };
    riskScore: number;
  };
  findings: Finding[];
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  asset: string;
  port?: number;
  cve?: string;
  cvss?: number;
  description: string;
  remediation: string;
}

export const DEMO_SCANS: ScanResult[] = [
  {
    id: 'scan_001',
    domain: 'acmecorp.com',
    status: 'completed',
    startedAt: '2025-05-14T08:12:00Z',
    completedAt: '2025-05-14T08:49:00Z',
    stats: {
      assetsDiscovered: 147,
      portsScanned: 18432,
      vulnerabilities: { critical: 3, high: 8, medium: 14, low: 22 },
      riskScore: 74,
    },
    findings: [
      { id: 'f1', title: 'Remote Code Execution via Log4Shell', severity: 'critical', asset: 'api.acmecorp.com', port: 8080, cve: 'CVE-2021-44228', cvss: 10.0, description: 'The application uses a vulnerable version of Log4j library that allows remote code execution via JNDI lookup.', remediation: 'Upgrade Log4j to version 2.17.1 or later. Apply the mitigation by setting log4j2.formatMsgNoLookups=true.' },
      { id: 'f2', title: 'SQL Injection in Login Endpoint', severity: 'critical', asset: 'app.acmecorp.com', port: 443, cve: 'CVE-2024-1234', cvss: 9.8, description: 'The login form is vulnerable to SQL injection, allowing attackers to bypass authentication or extract database contents.', remediation: 'Use parameterized queries or prepared statements. Implement input validation and a WAF.' },
      { id: 'f3', title: 'Exposed RDP Port', severity: 'critical', asset: 'admin.acmecorp.com', port: 3389, cvss: 9.1, description: 'RDP (Remote Desktop Protocol) is exposed to the internet without proper access controls, creating a high-risk attack vector.', remediation: 'Restrict RDP access to known IP ranges using firewall rules. Use a VPN for remote access.' },
      { id: 'f4', title: 'Outdated SSL/TLS Version (TLS 1.0)', severity: 'high', asset: 'mail.acmecorp.com', port: 443, cvss: 7.5, description: 'The server supports TLS 1.0 which is deprecated and vulnerable to POODLE and BEAST attacks.', remediation: 'Disable TLS 1.0 and 1.1. Configure the server to only accept TLS 1.2 and 1.3.' },
      { id: 'f5', title: 'Missing HTTP Security Headers', severity: 'medium', asset: 'www.acmecorp.com', port: 443, cvss: 5.4, description: 'Critical security headers (CSP, HSTS, X-Frame-Options) are missing, enabling clickjacking and XSS attacks.', remediation: 'Add Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, and X-Content-Type-Options headers.' },
      { id: 'f6', title: 'Subdomain Takeover Risk', severity: 'high', asset: 'staging.acmecorp.com', cvss: 8.1, description: 'The subdomain points to an unclaimed cloud resource, making it vulnerable to takeover by an attacker.', remediation: 'Remove the dangling DNS record or claim the cloud resource. Audit all CNAME records regularly.' },
    ],
  },
  {
    id: 'scan_002',
    domain: 'techstart.io',
    status: 'completed',
    startedAt: '2025-05-13T14:30:00Z',
    completedAt: '2025-05-13T15:08:00Z',
    stats: {
      assetsDiscovered: 43,
      portsScanned: 5376,
      vulnerabilities: { critical: 1, high: 3, medium: 7, low: 11 },
      riskScore: 52,
    },
    findings: [
      { id: 'f7', title: 'Exposed Admin Panel (No Auth)', severity: 'critical', asset: 'admin.techstart.io', port: 8080, cvss: 9.3, description: 'An administrative panel is accessible without authentication, exposing full system control.', remediation: 'Immediately restrict access. Implement strong authentication and move admin interfaces behind a VPN.' },
      { id: 'f8', title: 'Open MongoDB Instance', severity: 'high', asset: 'db.techstart.io', port: 27017, cvss: 8.6, description: 'A MongoDB database is accessible without authentication, exposing all stored data.', remediation: 'Enable MongoDB authentication. Restrict network access using firewall rules. Never expose databases to the internet.' },
    ],
  },
];

export function getScan(id: string): ScanResult | undefined {
  return DEMO_SCANS.find(s => s.id === id);
}

export function getScans(): ScanResult[] {
  return DEMO_SCANS;
}

export function getRiskColor(score: number): string {
  if (score >= 75) return '#ef4444';
  if (score >= 50) return '#f59e0b';
  if (score >= 25) return '#6366f1';
  return '#22c55e';
}

export function getRiskLabel(score: number): string {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#6366f1';
    case 'low': return '#22c55e';
    default: return '#94a3b8';
  }
}
