'use client';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { Trophy, Users, Zap, Star, ChevronDown, Shield, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Trophy,
    title: 'KES 100M Budget',
    desc: 'Build a 15-man squad across 4 tiers of Kenya Cup talent. Every shilling counts.',
    color: 'var(--gold)',
    bg: 'rgba(212,175,55,0.1)',
  },
  {
    icon: Users,
    title: 'Dynamic Player Pool',
    desc: '48+ players across all 12 Kenya Cup clubs. New signings and squad updates every round.',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.1)',
  },
  {
    icon: Zap,
    title: 'Tisini Live Stats',
    desc: 'Points update in real-time from Tisini match data — tries, assists, tackles and more.',
    color: 'var(--neon)',
    bg: 'rgba(57,255,20,0.08)',
  },
  {
    icon: Star,
    title: 'Boosters',
    desc: 'Triple Captain, Limitless squad, and Co-Captain boosters to turn good weeks into great ones.',
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.1)',
  },
  {
    icon: Shield,
    title: 'Mini-Leagues',
    desc: 'Compete in private leagues with friends or go head-to-head in public leaderboards.',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.1)',
  },
  {
    icon: BarChart3,
    title: 'Full Scoring Matrix',
    desc: 'Tries (5pts), Assists (3pts), Conversions (2pts), Lineouts, Scrums, Cards & more.',
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.1)',
  },
];

const RULES = [
  { label: 'Squad size', value: '15 players' },
  { label: 'Budget', value: 'KES 100M' },
  { label: 'Max per club', value: '3 players' },
  { label: 'Try', value: '+5 pts' },
  { label: 'Try assist', value: '+3 pts' },
  { label: 'Conversion', value: '+2 pts' },
  { label: 'Penalty goal', value: '+3 pts' },
  { label: 'Tackle', value: '+0.5 pts' },
  { label: 'Captain bonus', value: '×2 pts' },
  { label: 'Yellow card', value: '-3 pts' },
];

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 60px',
          display: 'grid', gridTemplateColumns: '1fr 420px', gap: '60px',
          alignItems: 'center', width: '100%',
        }}
          className="hero-grid"
        >
          {/* Left: Copy */}
          <div>
            {/* Live badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.25)', borderRadius: '100px', marginBottom: '28px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neon)', letterSpacing: '0.08em' }}>
                SEASON 26/27 · ROUND 4 · LIVE
              </span>
            </div>

            <h1 className="font-condensed" style={{
              fontSize: 'clamp(48px, 7vw, 84px)',
              fontWeight: 900,
              lineHeight: 0.95,
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}>
              <span style={{ display: 'block', color: 'var(--text-primary)' }}>KENYA CUP</span>
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 40%, #39FF14 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                FANTASY
              </span>
              <span style={{ display: 'block', color: 'var(--text-primary)' }}>RUGBY</span>
            </h1>

            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '36px' }}>
              Build your dream XV from 12 Kenya Cup clubs. Captain wisely, use your boosters, and climb the leaderboard with Tisini live stats powering every point.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <a href="#auth" className="btn btn-gold" style={{ fontSize: '15px', padding: '14px 28px' }}>
                Play Now — Free
              </a>
              <Link href="/dashboard" className="btn btn-outline" style={{ fontSize: '15px', padding: '14px 28px' }}>
                View Dashboard →
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
              {[['48+', 'Players'], ['12', 'Clubs'], ['100M', 'KES Cap'], ['15', 'Squad XV']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-condensed" style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Auth card */}
          <div id="auth" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Manager Account
              </p>
              <AuthCard />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#features" style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em',
          animation: 'float 3s ease-in-out infinite',
        }}>
          EXPLORE
          <ChevronDown size={16} />
        </a>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="font-condensed" style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: '12px' }}>
            EVERYTHING YOU NEED TO WIN
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
            A fantasy rugby experience built around Kenya Cup — built for Kenyan rugby fans.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card" style={{ padding: '24px', transition: 'transform 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scoring Rules ─────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px 80px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="font-condensed" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, marginBottom: '10px' }}>
              HOW POINTS WORK
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Powered by Tisini matchday data — real stats, real points.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {RULES.map(({ label, value }) => {
              const isNegative = value.startsWith('-');
              return (
                <div key={label} style={{
                  padding: '16px', borderRadius: '12px',
                  background: isNegative ? 'rgba(239,68,68,0.06)' : 'rgba(212,175,55,0.05)',
                  border: `1px solid ${isNegative ? 'rgba(239,68,68,0.2)' : 'rgba(212,175,55,0.15)'}`,
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </div>
                  <div className="font-condensed" style={{
                    fontSize: '24px', fontWeight: 900, lineHeight: 1,
                    color: isNegative ? 'var(--danger)' : 'var(--gold)',
                  }}>
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="font-condensed" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, marginBottom: '16px' }}>
            READY TO BUILD YOUR XV?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
            Assemble your 15-player lineup before the Round 4 kickoff deadline — <strong style={{ color: 'var(--gold)' }}>Fri 2 Oct · 18:00 EAT</strong>
          </p>
          <a href="#auth" className="btn btn-gold" style={{ fontSize: '16px', padding: '16px 40px' }}>
            Start Playing — It&apos;s Free
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <p>© 2026 Kenya Cup Fantasy Rugby · Built with Tisini Live Data · Season 26/27</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/squad" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>My Squad</Link>
          <Link href="/players" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Players</Link>
          <Link href="/leagues" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Leagues</Link>
          <Link href="/admin/login" style={{ color: '#F87171', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 Admin Portal
          </Link>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
}
