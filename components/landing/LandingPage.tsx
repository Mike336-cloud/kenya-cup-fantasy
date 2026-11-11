'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { Trophy, Users, Zap, Star, ChevronDown, Shield, BarChart3 } from 'lucide-react';
import { useClubsStore } from '@/lib/clubStore';
import { ClubLogo } from '@/components/common/ClubLogo';
import { KenyaCupLogo, OfficialSanctionedBadge } from '@/components/common/BrandLogo';
import { HowToPlaySection } from '@/components/landing/HowToPlaySection';

const FEATURES = [
  {
    icon: Trophy,
    title: 'KES 150M Budget',
    desc: 'Build a 23-man matchday squad (15 starters, 8 bench) across 4 tiers of Kenya Cup talent. Every shilling counts.',
    color: 'var(--gold)',
    bg: 'rgba(212,175,55,0.1)',
  },
  {
    icon: Users,
    title: 'Dynamic Player Pool',
    desc: 'Top players across all 12 Kenya Cup clubs. New signings and squad updates synchronized every round.',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.1)',
  },
  {
    icon: Zap,
    title: 'Tisini Live Stats',
    desc: 'Points update in real-time from Tisini match data — tries, assists, tackles, scrums and more.',
    color: 'var(--neon)',
    bg: 'rgba(57,255,20,0.08)',
  },
  {
    icon: Star,
    title: 'Tactical Boosters',
    desc: 'Triple Captain, Bench Boost, and Co-Captain boosters to turn decisive matchdays into runaway victories.',
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.1)',
  },
  {
    icon: Shield,
    title: 'Mini-Leagues',
    desc: 'Compete in private leagues with friends using 6-character invite codes or battle in the Global Kenya Cup Leaderboard.',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.1)',
  },
  {
    icon: BarChart3,
    title: 'Full Scoring Matrix',
    desc: 'Tries (+5), Conversions (+2), Penalties (+3), Forward Scrums & Lineouts (+2), 50:22s (+2), POTM (+3), Tackles & Cards.',
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.1)',
  },
];

export function LandingPage() {
  const { clubs, fetchClubs } = useClubsStore();

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // Ensure 12 clubs are mirrored for seamless infinite scrolling marquee
  const displayClubs = clubs.length > 0 ? clubs : [];
  const marqueeClubs = [...displayClubs, ...displayClubs];

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
            {/* Live badge & Official Sanctioned Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.25)', borderRadius: '100px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neon)', letterSpacing: '0.08em' }}>
                  SEASON 26/27 · ROUND 1 · KICKOFF SAT 21 NOV
                </span>
              </div>
              <OfficialSanctionedBadge />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <KenyaCupLogo size={72} />
              <h1 className="font-condensed" style={{
                fontSize: 'clamp(44px, 6.5vw, 80px)',
                fontWeight: 900,
                lineHeight: 0.95,
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                <span style={{ display: 'block', color: 'var(--text-primary)' }}>KENYA CUP</span>
                <span style={{ display: 'block', background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 40%, #39FF14 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  FANTASY
                </span>
                <span style={{ display: 'block', color: 'var(--text-primary)' }}>RUGBY</span>
              </h1>
            </div>

            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '36px' }}>
              Build your dream 23-man matchday squad from 12 Kenya Cup clubs. Captain strategically, deploy Bench Boost, and climb the leaderboards with Tisini live stats powering every point.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <a href="#auth" className="btn btn-gold" style={{ fontSize: '15px', padding: '14px 28px' }}>
                Play Now — Free
              </a>
              <a href="#how-to-play" className="btn btn-outline" style={{ fontSize: '15px', padding: '14px 28px' }}>
                How to Play &amp; Rules ↓
              </a>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
              {[['48+', 'Players'], ['12', 'Clubs'], ['150M', 'KES Cap'], ['23', 'Roster']].map(([val, label]) => (
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
        <a href="#clubs-marquee" style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em',
          animation: 'float 3s ease-in-out infinite',
        }}>
          EXPLORE
          <ChevronDown size={16} />
        </a>
      </section>

      {/* ── 12 Kenya Cup Clubs Marquee ─────────────────────────────────────── */}
      <section id="clubs-marquee" style={{
        padding: '36px 0',
        background: 'rgba(255, 255, 255, 0.015)',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 20px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px' }}>🏉</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
            }}>
              OFFICIAL 2026/27 KENYA CUP CLUBS
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            12 Premiership Teams
          </span>
        </div>

        {/* Marquee Container with side fades */}
        <div style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        }}>
          <div className="marquee-track" suppressHydrationWarning style={{
            display: 'flex',
            gap: '24px',
            width: 'max-content',
            animation: 'marquee 35s linear infinite',
          }}>
            {marqueeClubs.map((club, idx) => (
              <div
                key={`${club.id || club.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 18px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <ClubLogo clubName={club.name} size={36} showBorder={true} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap' }}>
                    {club.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
                    {club.abbreviation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="font-condensed" style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: '12px' }}>
            EVERYTHING YOU NEED TO WIN
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
            A fantasy rugby experience built specifically for the Kenya Cup — built for Kenyan rugby fans.
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

      {/* ── Comprehensive "How to Play" & Rules Section ───────────────── */}
      <HowToPlaySection />

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="font-condensed" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, marginBottom: '16px' }}>
            READY TO BUILD YOUR MATCHDAY 23?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
            Assemble your 23-player lineup before the Round 1 kickoff deadline — <strong style={{ color: 'var(--gold)' }}>Sat 21 Nov · 08:00 EAT</strong>
          </p>
          <a href="#auth" className="btn btn-gold" style={{ fontSize: '16px', padding: '16px 40px' }}>
            Start Playing — It&apos;s Free
          </a>
        </div>
      </section>

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
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
