'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Prototype / Demo mode without Supabase connection
        if (email.toLowerCase().includes('admin') || password.length >= 6) {
          sessionStorage.setItem('kc_admin_session', 'true');
          sessionStorage.setItem('kc_admin_email', email || 'admin@kenyacup.co.ke');
          setSuccess(true);
          setTimeout(() => router.push('/admin'), 600);
          return;
        } else {
          throw new Error('Please enter valid administrator credentials or use the demo login.');
        }
      }

      // Supabase Authentication flow
      const client = getSupabase();
      const { data: authData, error: signInError } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('No user returned from authentication.');

      // Strict Database Security Check: verify is_admin flag in fantasy_users table
      const { data: profile, error: profileError } = await client
        .from('fantasy_users')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      const isAdmin = !!(profile as { is_admin?: boolean } | null)?.is_admin;

      if (profileError || !isAdmin) {
        // Sign out immediately to purge any regular fan session
        await client.auth.signOut();
        throw new Error('⛔ Access Denied: This account is not registered with administrator privileges. Regular fans must use the main portal.');
      }

      // Explicit admin confirmed
      sessionStorage.setItem('kc_admin_session', 'true');
      sessionStorage.setItem('kc_admin_email', authData.user.email ?? email);
      setSuccess(true);
      setTimeout(() => router.push('/admin'), 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminLogin = () => {
    sessionStorage.setItem('kc_admin_session', 'true');
    sessionStorage.setItem('kc_admin_email', 'admin@kenyacup.co.ke');
    setSuccess(true);
    setTimeout(() => router.push('/admin'), 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 20%, #1a0f12 0%, #080c14 70%, #03060a 100%)',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Return to Fan Portal Link */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--text-muted)', textDecoration: 'none',
          fontSize: '13px', fontWeight: 600,
          padding: '8px 14px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.2s',
        }}>
          <ArrowLeft size={14} /> Back to Fan Home
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.08)',
      }}>
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.35))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          }}>
            <ShieldAlert size={28} color="#F87171" />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-block', padding: '3px 10px',
            borderRadius: '100px', background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '10px', fontWeight: 800, color: '#F87171',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Restricted Access
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '28px', fontWeight: 800, color: '#F8FAFC',
            lineHeight: 1.1, margin: '4px 0 6px',
          }}>
            Admin Authentication
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Kenya Cup Fantasy Rugby Operations & Tournament Control Console
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={44} color="#34D399" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#34D399' }}>
              Admin Privileges Verified
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Redirecting to Tournament Management Portal…
            </p>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Admin Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="admin@kenyacup.co.ke"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px', borderColor: 'rgba(255,255,255,0.12)' }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Master Key / Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  className="input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '40px', borderColor: 'rgba(255,255,255,0.12)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#FCA5A5',
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying Credentials…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Authenticate Admin Session
                </>
              )}
            </button>

            {/* Mock / Quick Access Button for non-production environments */}
            {!isSupabaseConfigured && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  🛠 Prototype Mode (Supabase not connected)
                </div>
                <button
                  type="button"
                  onClick={handleDemoAdminLogin}
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '12px', padding: '8px', color: '#FCD34D' }}
                >
                  Quick Sign-In as Demo Admin →
                </button>
              </div>
            )}
          </form>
        )}

        {/* Security Notice */}
        <div style={{
          marginTop: '24px', paddingTop: '18px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          Unauthorized attempts to access the administration console are logged and monitored.
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '6px',
};
