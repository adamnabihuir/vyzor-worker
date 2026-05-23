'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const RULES = [
  { label: 'Au moins 8 caractères',   test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule',           test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un chiffre',              test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un caractère spécial',    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type Status = 'idle' | 'loading' | 'done';

export default function ForcePasswordPage() {
  const { user, isLoaded } = useUser();
  const router             = useRouter();

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [focused, setFocused]     = useState(false);
  const [status, setStatus]       = useState<Status>('idle');
  const [error, setError]         = useState('');

  const passwordStrong = RULES.every(r => r.test(password));
  const passScore      = RULES.filter(r => r.test(password)).length;
  const barColor       = passScore <= 1 ? '#ef4444' : passScore === 2 ? '#f59e0b' : passScore === 3 ? '#6366f1' : '#34d399';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !user) return;

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!passwordStrong) {
      setError('Le mot de passe ne respecte pas les règles de sécurité.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      await user.updatePassword({ newPassword: password });
      setStatus('done');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        (err instanceof Error ? err.message : 'Erreur inconnue.');
      setError(msg);
      setStatus('idle');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <Loader2 size={32} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0f172a' }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
        </div>

        {/* Notice */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-400">Mot de passe requis</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(245,158,11,0.7)' }}>
              Votre compte n&apos;a pas de mot de passe. Définissez-en un pour continuer.
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-1">Définir un mot de passe</h1>
        <p className="text-slate-400 text-sm mb-7">
          Sécurisez votre compte avec un mot de passe fort.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(passScore / 4) * 100}%`, background: barColor }}
                />
              </div>
            )}

            {/* Rules */}
            {(focused || password.length > 0) && (
              <ul className="mt-2 space-y-1">
                {RULES.map(rule => (
                  <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                    <span style={{ color: rule.test(password) ? '#34d399' : '#475569' }}>
                      {rule.test(password) ? '✓' : '○'}
                    </span>
                    <span style={{ color: rule.test(password) ? '#34d399' : '#64748b' }}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Répétez le mot de passe"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                className={`w-full bg-slate-800/60 border rounded-lg px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                  confirm.length > 0 && confirm !== password
                    ? 'border-red-500/60 focus:ring-red-500/20'
                    : confirm.length > 0 && confirm === password
                    ? 'border-emerald-500/60 focus:ring-emerald-500/20'
                    : 'border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConf(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirm.length > 0 && confirm !== password && (
              <p className="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas.</p>
            )}
            {confirm.length > 0 && confirm === password && (
              <p className="mt-1 text-xs text-emerald-400">✓ Les mots de passe correspondent.</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading' || status === 'done' || !passwordStrong || password !== confirm}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#10b981', color: '#021a12' }}
          >
            {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {status === 'loading' ? 'Enregistrement…' : status === 'done' ? '✓ Enregistré !' : 'Enregistrer le mot de passe →'}
          </button>
        </form>
      </div>
    </div>
  );
}
