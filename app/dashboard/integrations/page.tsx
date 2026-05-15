'use client';

import { useState } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const CONNECTED_INTEGRATIONS = [
  {
    name: 'Slack',
    icon: '💬',
    description: 'Alerts sent to #security channel',
    action: 'disconnect',
  },
  {
    name: 'Jira',
    icon: '🔵',
    description: 'Issues auto-created in PROJECT board',
    action: 'configure',
  },
  {
    name: 'PagerDuty',
    icon: '📟',
    description: 'Critical alerts trigger on-call',
    action: 'configure',
  },
  {
    name: 'GitHub',
    icon: '🐙',
    description: 'Scan on every PR to main',
    action: 'disconnect',
  },
];

const AVAILABLE_INTEGRATIONS = [
  { name: 'Microsoft Teams', icon: '👥', desc: 'Receive security alerts in Teams channels' },
  { name: 'Splunk', icon: '📊', desc: 'Forward events and scan data to Splunk SIEM' },
  { name: 'ServiceNow', icon: '⚙️', desc: 'Auto-create tickets for new vulnerabilities' },
  { name: 'Webhook API', icon: '🔗', desc: 'Send events to any custom HTTP endpoint' },
  { name: 'Datadog', icon: '🐶', desc: 'Stream security metrics into Datadog dashboards' },
  { name: 'AWS Security Hub', icon: '☁️', desc: 'Push findings to AWS Security Hub' },
  { name: 'Azure Sentinel', icon: '🛡️', desc: 'Ingest alerts into Azure Sentinel workspace' },
  { name: 'Okta SSO', icon: '🔐', desc: 'Manage access with Okta as identity provider' },
  { name: 'Notion', icon: '📓', desc: 'Sync vulnerability reports to Notion pages' },
  { name: 'Linear', icon: '📐', desc: 'Create Linear issues for discovered findings' },
  { name: 'Zapier', icon: '⚡', desc: 'Connect to 5,000+ apps via Zapier workflows' },
  { name: 'Email SMTP', icon: '📧', desc: 'Send scan alerts via your own SMTP server' },
];

const WEBHOOK_EVENTS = [
  { key: 'scan.completed', label: 'scan.completed' },
  { key: 'vulnerability.critical', label: 'vulnerability.critical' },
  { key: 'asset.discovered', label: 'asset.discovered' },
  { key: 'certificate.expiring', label: 'certificate.expiring' },
];

export default function IntegrationsPage() {
  const [disconnected, setDisconnected] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [webhookRevealed, setWebhookRevealed] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [enabledEvents, setEnabledEvents] = useState<Set<string>>(new Set(['scan.completed', 'vulnerability.critical']));
  const [saved, setSaved] = useState(false);

  const connectedCount = CONNECTED_INTEGRATIONS.filter(i => !disconnected.has(i.name)).length + connected.size;

  const handleDisconnect = (name: string) => {
    setDisconnected(prev => new Set([...prev, name]));
  };

  const handleConnect = (name: string) => {
    setConnected(prev => new Set([...prev, name]));
  };

  const handleCopy = () => {
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const toggleEvent = (key: string) => {
    setEnabledEvents(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Integrations</h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.875rem' }}>Connect Vyzor to your existing security stack</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
          <span style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 700 }}>{connectedCount} connected</span>
        </div>
      </div>

      {/* Connected integrations */}
      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(167,243,208,0.4)' }}>
          Connected
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONNECTED_INTEGRATIONS.filter(i => !disconnected.has(i.name)).map(integration => (
            <div key={integration.name} className="rounded-2xl p-5" style={GLASS}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {integration.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#f0fdf4' }}>{integration.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                    <span style={{ color: '#34d399', fontSize: '0.7rem', fontWeight: 600 }}>Connected</span>
                  </div>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(167,243,208,0.55)', lineHeight: 1.5 }}>
                {integration.description}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                {integration.action === 'disconnect' ? (
                  <button
                    onClick={() => handleDisconnect(integration.name)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  >
                    Configure
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Newly connected from available */}
          {AVAILABLE_INTEGRATIONS.filter(i => connected.has(i.name)).map(integration => (
            <div key={integration.name} className="rounded-2xl p-5" style={GLASS}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {integration.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#f0fdf4' }}>{integration.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                    <span style={{ color: '#34d399', fontSize: '0.7rem', fontWeight: 600 }}>Connected</span>
                  </div>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(167,243,208,0.55)', lineHeight: 1.5 }}>
                {integration.desc}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                <button
                  onClick={() => setConnected(prev => { const n = new Set(prev); n.delete(integration.name); return n; })}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Available integrations */}
      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(167,243,208,0.4)' }}>
          Available Integrations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_INTEGRATIONS.filter(i => !connected.has(i.name)).map(integration => (
            <div key={integration.name} className="rounded-2xl p-5 flex flex-col" style={GLASS}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  {integration.icon}
                </div>
                <p className="font-bold text-sm" style={{ color: '#f0fdf4' }}>{integration.name}</p>
              </div>
              <p className="text-xs flex-1 mb-4" style={{ color: 'rgba(167,243,208,0.55)', lineHeight: 1.6 }}>
                {integration.desc}
              </p>
              <button
                onClick={() => handleConnect(integration.name)}
                className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.08)')}
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Webhook section */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(167,243,208,0.4)' }}>
          Webhook Configuration
        </h2>
        <div className="rounded-2xl p-6" style={GLASS}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: URL + Secret */}
            <div>
              <div className="mb-5">
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.55)' }}>
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2.5 rounded-xl font-mono text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: webhookRevealed ? '#f0fdf4' : 'rgba(167,243,208,0.3)',
                      letterSpacing: webhookRevealed ? 'normal' : '0.2em',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {webhookRevealed
                      ? 'https://hooks.vyzor.io/wh/2k9xPmN4qR7tLvDc'
                      : '••••••••••••••••••••••••••••••••••••'}
                  </div>
                  <button
                    onClick={() => setWebhookRevealed(v => !v)}
                    className="p-2.5 rounded-xl flex-shrink-0 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(167,243,208,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
                    title={webhookRevealed ? 'Hide' : 'Reveal'}
                  >
                    {webhookRevealed
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl flex-shrink-0 transition-all"
                    style={{ background: webhookCopied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.07)', color: webhookCopied ? '#34d399' : 'rgba(167,243,208,0.55)', border: '1px solid', borderColor: webhookCopied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)' }}
                    title="Copy"
                  >
                    {webhookCopied
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.55)' }}>
                  Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2.5 rounded-xl font-mono text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: secretRevealed ? '#f0fdf4' : 'rgba(167,243,208,0.3)',
                      letterSpacing: secretRevealed ? 'normal' : '0.2em',
                    }}
                  >
                    {secretRevealed ? 'whsec_8fNpX3qZmL5vKtRwUcDjEyHs' : '••••••••••••••••••••••••'}
                  </div>
                  <button
                    onClick={() => setSecretRevealed(v => !v)}
                    className="p-2.5 rounded-xl flex-shrink-0 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(167,243,208,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
                    title={secretRevealed ? 'Hide' : 'Reveal'}
                  >
                    {secretRevealed
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Events + Save */}
            <div>
              <label className="block mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.55)' }}>
                Events to send
              </label>
              <div className="space-y-2 mb-6">
                {WEBHOOK_EVENTS.map(ev => (
                  <label key={ev.key} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleEvent(ev.key)}
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-all"
                      style={{
                        background: enabledEvents.has(ev.key) ? '#34d399' : 'rgba(255,255,255,0.06)',
                        border: enabledEvents.has(ev.key) ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {enabledEvents.has(ev.key) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#021a12" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: enabledEvents.has(ev.key) ? '#f0fdf4' : 'rgba(167,243,208,0.55)' }}
                      onClick={() => toggleEvent(ev.key)}
                    >
                      {ev.label}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: saved ? 'rgba(52,211,153,0.15)' : '#34d399',
                  color: saved ? '#34d399' : '#021a12',
                  border: saved ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#2ec48a'; }}
                onMouseLeave={e => { if (!saved) e.currentTarget.style.background = '#34d399'; }}
              >
                {saved ? '✓ Saved' : 'Save webhook'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
