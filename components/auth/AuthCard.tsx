'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode]         = useState<AuthMode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [username, setUsername]  = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const client = getSupabase();
      if (mode === 'signup') {
        const { error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: { data: { teamName, username: username.toLowerCase().replace(/[^a-z0-9_]/g, '') } },
        });
        if (signUpError) throw signUpError;
        setSuccess('✅ Account created! Check your email to confirm, then sign in.');
      } else {
        const { error: signInError } = await client.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Not configured banner ─────────────────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: '20px', padding: '28px',
        width: '100%', maxWidth: '420px',
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚙️</div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FCD34D', marginBottom: '8px' }}>Supabase Not Configured</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
          The app is running in <strong style={{ color: 'var(--gold)' }}>mock-data mode</strong>. Authentication is disabled until you connect Supabase.
        </p>
        <a href="#setup-guide" style={{ fontSize: '12px', color: '#FCD34D', fontWeight: 700 }}>
          See setup guide below →
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      backdropFilter: 'blur(20px)',
      padding: '32px',
      width: '100%',
      maxWidth: '420px',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '28px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '4px' }}>
        {(['login', 'signup'] as AuthMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
              background: mode === m ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: mode === m ? 'var(--gold)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
            {m === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {success ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
          <p style={{ color: 'var(--success)', fontSize: '14px', lineHeight: 1.6 }}>{success}</p>
          <button onClick={() => { setSuccess(null); setMode('login'); }} className="btn btn-gold" style={{ marginTop: '20px', width: '100%' }}>
            Sign In Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={labelStyle}>Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>@</span>
                  <input className="input" required value={username}
                    minLength={3} maxLength={20}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. mike_xv"
                    style={{ paddingLeft: '30px' }} />
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Lowercase letters, numbers & underscores only</div>
              </div>
              <div>
                <label style={labelStyle}>Team Name</label>
                <input className="input" required value={teamName} onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Nairobi Dream XV" />
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} required
                minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters" style={{ paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-gold" disabled={loading}
            style={{ padding: '14px', fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : mode === 'login' ? 'Sign In & Play' : 'Create Account'
            }
          </button>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              No account?{' '}
              <button type="button" onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                Create one free →
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '7px',
};
