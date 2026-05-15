'use client';

import { useState, useRef, useEffect } from 'react';

const PROMPTS = [
  { icon: '✅', text: 'Validate my issues' },
  { icon: '🔇', text: 'Snooze issues' },
  { icon: '🎯', text: 'Add targets' },
  { icon: '🏷️', text: 'Manage tags' },
  { icon: '🔧', text: 'Walk me through a misconfiguration fix' },
  { icon: '📋', text: 'Summarize vulnerabilities for the leadership team' },
];

type Message = { role: 'user' | 'ai'; text: string; ts: string };

const AI_RESPONSES: Record<string, string> = {
  default: "I've analyzed your attack surface. You have 11 open issues across 2 targets. The most critical items are the Log4Shell vulnerability on techstart.io (CVSS 10.0) and the open RDP port on acmecorp.com. I recommend prioritizing these immediately.\n\nWould you like me to walk you through remediation steps for any of these?",
  validate: "I've reviewed your 11 open issues. After cross-referencing with your current scan data:\n\n**Confirmed real threats:**\n• Log4Shell (CVE-2021-44228) on techstart.io — CRITICAL, actively exploited\n• Open RDP Port on acmecorp.com — HIGH risk\n\n**Likely false positives:**\n• 3 of the TLS cipher issues are already covered by your WAF config\n\n**Recommended action:** Focus on Log4Shell first. Patch Apache Log4j to 2.17.1+.",
  snooze: "Here are the issues I recommend snoozeing for now:\n\n• **Insecure SSH Integrity Settings** — Low severity, mitigated by network segmentation\n• **Weak SSH Key Exchange Algorithms** — Your internal policy allows these for legacy systems\n\nShall I snooze these for 30 days and set a reminder?",
  summarize: "**Executive Summary — Attack Surface Report**\n\nYour organization currently has **11 open security issues** across 2 external targets.\n\n🔴 **Critical (1):** Log4Shell vulnerability requires immediate patching\n🟡 **High (3):** RDP exposure and TLS misconfigurations\n🔵 **Medium/Low (7):** SSH configuration improvements recommended\n\n**Cyber Hygiene Score: A+**\nYour team is responding to issues faster than 87% of similar organizations.\n\n**Next steps:** Schedule emergency patch for Log4j within 48 hours.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('validate') || lower.includes('false positive')) return AI_RESPONSES.validate;
  if (lower.includes('snooze')) return AI_RESPONSES.snooze;
  if (lower.includes('summar') || lower.includes('leadership') || lower.includes('report')) return AI_RESPONSES.summarize;
  return AI_RESPONSES.default;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text, ts: now }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getAIResponse(text), ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Chat history sidebar */}
      {sidebarOpen && (
        <div className="flex-shrink-0 flex flex-col" style={{ width: '220px', background: '#fafafa', borderRight: '1px solid #f1f5f9', height: '100%' }}>
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1, #0ea5e9)' }}>🤖</div>
              <span className="font-black text-sm" style={{ color: '#0f172a' }}>VyzorAI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ color: '#94a3b8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </div>
          <div className="px-3 py-3">
            <button onClick={() => setMessages([])}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New chat
            </button>
          </div>
          <div className="px-3 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide px-2 mb-2" style={{ color: '#94a3b8' }}>Chats</p>
            {chats.length === 0 && (
              <p className="text-xs px-2" style={{ color: '#94a3b8' }}>No recent chats</p>
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ height: '100%' }}>
        {!sidebarOpen && (
          <div className="flex items-center gap-2 px-6 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="font-black text-sm" style={{ color: '#0f172a' }}>VyzorAI</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.1))', border: '1px solid rgba(99,102,241,0.15)' }}>
                🤖
              </div>
              <h2 className="font-black text-xl mb-1" style={{ color: '#0f172a' }}>VyzorAI</h2>
              <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>Meet Vyzor's AI security analyst</p>

              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => send(p.text)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <span>{p.icon}</span>
                    <span>{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-1"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #0ea5e9)' }}>🤖</div>
                  )}
                  <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed`}
                    style={{
                      background: msg.role === 'user' ? '#6366f1' : '#f8fafc',
                      color: msg.role === 'user' ? '#fff' : '#0f172a',
                      border: msg.role === 'ai' ? '1px solid #f1f5f9' : 'none',
                      whiteSpace: 'pre-line',
                    }}>
                    {msg.text}
                    <p className="text-xs mt-2 opacity-60">{msg.ts}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', color: '#fff' }}>AB</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #0ea5e9)' }}>🤖</div>
                  <div className="rounded-2xl px-4 py-4 flex items-center gap-1.5" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366f1', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-8 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 p-3 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="How can I help?"
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none"
                style={{ color: '#0f172a', minHeight: '24px', maxHeight: '120px' }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                style={{ background: input.trim() ? '#6366f1' : '#e2e8f0' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : '#94a3b8'} strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              </button>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: '#94a3b8' }}>VyzorAI can make mistakes. Always verify critical security decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
