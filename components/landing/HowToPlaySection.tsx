'use client';
import { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  ArrowLeftRight,
  Zap,
  Lock,
  Clock,
  Coins,
  Shield,
  Star,
  Globe,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
  Flame,
  Check,
} from 'lucide-react';
import { SCORING_RULES } from '@/lib/fantasyRules';

type TabType = 'squad' | 'lockouts' | 'scoring' | 'boosters' | 'leagues';

export function HowToPlaySection() {
  const [activeTab, setActiveTab] = useState<TabType>('squad');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash === '#scoring' || hash === '#scoring-matrix' || hash === '#scoring-rules') {
          setActiveTab('scoring');
        } else if (hash === '#squad') {
          setActiveTab('squad');
        } else if (hash === '#lockouts' || hash === '#transfers') {
          setActiveTab('lockouts');
        } else if (hash === '#boosters' || hash === '#chips') {
          setActiveTab('boosters');
        } else if (hash === '#leagues') {
          setActiveTab('leagues');
        }
      };

      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  return (
    <section id="how-to-play" style={{
      padding: '90px 24px 80px',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.95) 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
      position: 'relative',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Section Header ──────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '100px',
            marginBottom: '16px',
          }}>
            <Sparkles size={13} color="var(--gold)" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Official Kenya Cup Guide
            </span>
          </div>

          <h2 className="font-condensed" style={{
            fontSize: 'clamp(36px, 5.5vw, 60px)',
            fontWeight: 900,
            lineHeight: 1,
            color: '#FFF',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>
            HOW TO PLAY &amp; COMPREHENSIVE RULES
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '16px',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Everything you need to know about building your 23-man matchday squad, rolling lockouts, tactical chips, and the overhauled scoring matrix.
          </p>
        </div>

        {/* ── 4-Step "How to Play" Visual Row ─────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '64px',
        }}>
          {[
            {
              step: '01',
              title: 'Build Your Squad',
              tab: 'squad' as TabType,
              desc: 'Select 15 Starters and 8 Substitutes within the KES 150M salary cap from across all 12 Kenya Cup clubs.',
              icon: Users,
              color: 'var(--gold)',
              bg: 'rgba(212, 175, 55, 0.1)',
            },
            {
              step: '02',
              title: 'Join Mini-Leagues',
              tab: 'leagues' as TabType,
              desc: 'Auto-enrolled in the Global Leaderboard. Create or join private leagues with friends using 6-character invite codes.',
              icon: Trophy,
              color: '#60A5FA',
              bg: 'rgba(96, 165, 250, 0.1)',
            },
            {
              step: '03',
              title: 'Manage Transfers & Subs',
              tab: 'lockouts' as TabType,
              desc: 'Enjoy rolling lockouts. Swap bench players and transfer talent right up until their individual fixture kickoff.',
              icon: ArrowLeftRight,
              color: 'var(--neon)',
              bg: 'rgba(57, 255, 20, 0.08)',
            },
            {
              step: '04',
              title: 'Score Points & Win',
              tab: 'scoring' as TabType,
              desc: 'Powered live by Tisini data. Tries, conversions, forward scrums, 50:22s, and player of the match earn big points.',
              icon: Zap,
              color: '#C084FC',
              bg: 'rgba(192, 132, 252, 0.1)',
            },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="card"
                onClick={() => {
                  setActiveTab(s.tab);
                  const el = document.getElementById('rules-tab-content');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: '28px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(15, 23, 42, 0.55)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.borderColor = s.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: s.bg,
                    border: `1px solid ${s.color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={22} color={s.color} />
                  </div>
                  <span className="font-condensed" style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: 'rgba(255, 255, 255, 0.15)',
                    letterSpacing: '0.05em',
                  }}>
                    {s.step}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF', margin: '0 0 10px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Interactive Rules Tabs ──────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '32px',
        }}>
          {[
            { id: 'squad', label: '🏉 Squad & Budget' },
            { id: 'lockouts', label: '⏱️ Lockouts & Transfers' },
            { id: 'scoring', label: '📊 Scoring Matrix' },
            { id: 'boosters', label: '⚡ Tactical Boosters' },
            { id: 'leagues', label: '🏆 Leagues & Architecture' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 0 20px rgba(212, 175, 55, 0.15)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content Container ────────────────────────────────────────── */}
        <div className="card" style={{
          padding: '40px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
          borderRadius: '20px',
        }}>

          {/* ── TAB 1: SQUAD BUILDING & BUDGET ────────────────────────────── */}
          {activeTab === 'squad' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="var(--gold)" />
                </div>
                <div>
                  <h3 className="font-condensed" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#FFF' }}>
                    SQUAD ASSEMBLY &amp; SALARY CAP
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Rules governing your 23-man matchday roster and dynamic player market.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                    <Shield size={16} /> The 23-Man Matchday Roster
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    You must select a full <strong>23-man squad</strong> consisting of exactly <strong>15 Starting Players</strong> and <strong>8 Substitutes</strong>. Only starting players score points for your team, unless the <em>Bench Boost</em> chip is activated!
                  </p>
                </div>

                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon)', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                    <Coins size={16} /> KES 150,000,000 Budget
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    You have a strict starting salary cap of <strong>KES 150M</strong>. Player prices range from KES 3.5M (Tier 4 prospects) to KES 10M+ (Tier 1 international stars). Balance your budget across forwards and backs.
                  </p>
                </div>

                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} /> Maximum 3 Players Per Club
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    To ensure tactical diversity and competitive integrity, you can select a <strong>maximum of 3 players</strong> from any single Kenya Cup club (e.g. max 3 from Kabras Sugar, max 3 from KCB).
                  </p>
                </div>

                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                    <TrendingUp size={16} /> Dynamic Transfer Market Pricing
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    Player values are not static. At the end of every round, values fluctuate based on their <strong>weighted 3-match form rating</strong> vs. baseline tier expectations. Emerging breakout stars quickly gain value!
                  </p>
                </div>
              </div>

              {/* Positional constraints breakdown */}
              <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', margin: '0 0 12px' }}>
                  23-MAN SQUAD POSITIONAL REQUIREMENTS
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>Props: <strong>3 – 6</strong></div>
                  <div>Hookers: <strong>2 – 4</strong></div>
                  <div>Locks: <strong>3 – 5</strong></div>
                  <div>Flankers: <strong>3 – 6</strong></div>
                  <div>Number 8: <strong>1 – 3</strong></div>
                  <div>Scrum-half: <strong>2 – 4</strong></div>
                  <div>Fly-half: <strong>2 – 4</strong></div>
                  <div>Centers: <strong>2 – 5</strong></div>
                  <div>Wings: <strong>2 – 5</strong></div>
                  <div>Full-back: <strong>1 – 3</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: ROLLING LOCKOUTS & TRANSFERS ───────────────────────── */}
          {activeTab === 'lockouts' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(57,255,20,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="var(--neon)" />
                </div>
                <div>
                  <h3 className="font-condensed" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#FFF' }}>
                    MATCHDAY ROLLING LOCKOUTS &amp; TRANSFERS
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Full tactical flexibility up to the opening whistle.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(57, 255, 20, 0.04)', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon)', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
                    <Lock size={16} /> The Rolling Matchday Lockout (🔒)
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    Unlike traditional fantasy games that lock your entire 23-man squad the second the first match of the round kicks off, Kenya Cup Fantasy utilizes a <strong>Rolling Matchday Lockout</strong>.
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0 0' }}>
                    A player is strictly locked (🔒) at the <strong>exact minute their specific real-world fixture kicks off</strong>. For example, if Kabras play at 14:00 and KCB play at 16:00, you can still substitute or transfer your KCB players between 14:00 and 16:00!
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--gold)', marginBottom: '6px' }}>
                      Unlimited Pre-Season Transfers
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      You can buy, sell, and reshape your 23-man lineup with zero point deductions prior to the official Round 1 kickoff on <strong>Saturday 21 November 2026</strong>.
                    </p>
                  </div>

                  <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#60A5FA', marginBottom: '6px' }}>
                      In-Gameweek Bench Swaps
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      You can freely swap any unlocked starter with an unlocked substitute on your bench. Once a player&apos;s fixture kicks off, they can no longer be swapped or transferred out.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: OVERHAULED SCORING MATRIX ──────────────────────────── */}
          {activeTab === 'scoring' && (
            <div id="scoring-matrix">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color="var(--gold)" />
                  </div>
                  <div>
                    <h3 className="font-condensed" style={{ fontSize: '26px', fontWeight: 900, margin: 0, color: '#FFF' }}>
                      OFFICIAL KENYA CUP SCORING MATRIX
                    </h3>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Powered in real-time by Tisini live match statistics. Unified scoring with full backward compatibility.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.25)' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--neon)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--neon)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    LIVE TISINI SYNC ACTIVE
                  </span>
                </div>
              </div>

              {/* 30 hour audit notice */}
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#93C5FD' }}>
                <Clock size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Instant Provisional Scoring &amp; Audit Lock:</strong> Live match points calculate in real-time on matchday. Official KRU/Tisini verified statistical audits lock permanently <strong>30 hours</strong> post-match.
                </span>
              </div>

              {/* Quick Highlight Badges Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
                marginBottom: '28px',
              }}>
                {[
                  { label: 'Try', val: '+5.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Penalty Goal', val: '+3.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Drop Goal', val: '+3.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Conversion', val: '+2.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Starter', val: '+2.0 pts', color: 'var(--neon)', bg: 'rgba(57,255,20,0.08)' },
                  { label: 'Team Win', val: '+2.0 pts', color: 'var(--neon)', bg: 'rgba(57,255,20,0.08)' },
                  { label: 'POTM', val: '+3.0 pts', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                  { label: '50:22 Kick', val: '+2.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Scrums 100%', val: '+2.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Lineouts 90%', val: '+2.0 pts', color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
                  { label: 'Try Assist', val: '+2.0 pts', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
                  { label: '5m Carried', val: '+0.5 pt', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
                  { label: '5 Tackles', val: '+1.0 pt', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
                  { label: 'Yellow Card', val: '-4.0 pts', color: '#F87171', bg: 'rgba(239,68,68,0.1)' },
                  { label: 'Red Card', val: '-8.0 pts', color: '#F87171', bg: 'rgba(239,68,68,0.1)' },
                ].map(b => (
                  <div key={b.label} style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: b.bg,
                    border: `1px solid ${b.color}33`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {b.label}
                    </div>
                    <div className="font-condensed" style={{ fontSize: '17px', fontWeight: 900, color: b.color, marginTop: '2px' }}>
                      {b.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Matrix Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                {/* Appearance & Scoring Plays */}
                <div style={{ padding: '22px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Shield size={16} color="var(--gold)" />
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', margin: 0 }}>
                      APPEARANCE &amp; SCORING PLAYS
                    </h4>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Starting Player (In Starting XV)</span><strong style={{ color: 'var(--neon)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Substitute Appearance (Off Bench)</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Player&apos;s Team Wins</span><strong style={{ color: 'var(--neon)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Player&apos;s Team Draws</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Try Scored</span><strong style={{ color: 'var(--gold)' }}>+5.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Conversion Scored</span><strong style={{ color: 'var(--gold)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Penalty Goal Scored</span><strong style={{ color: 'var(--gold)' }}>+3.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Penalty Kick Missed</span><strong style={{ color: '#F87171' }}>-0.5 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Drop Goal Scored</span><strong style={{ color: 'var(--gold)' }}>+3.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                      <span>Legacy Minutes Played</span><span>60+ min: +2 | 30–59 min: +1</span>
                    </li>
                  </ul>
                </div>

                {/* Team Forward Set-Piece Mastery */}
                <div style={{ padding: '22px', borderRadius: '14px', background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px' }}>🏉</span>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', margin: 0 }}>
                        FORWARD SET-PIECE MASTERY
                      </h4>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                    Applied exclusively to Props, Hookers, Locks, Flankers &amp; Number 8:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Win 100% of Own Scrums</span><strong style={{ color: 'var(--gold)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Scrum Won on Opponent Put-in</span><strong style={{ color: 'var(--gold)' }}>+1.0 pt / scrum</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Win 90%+ of Own Lineouts</span><strong style={{ color: 'var(--gold)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Win 20%+ Opponent Lineouts</span><strong style={{ color: 'var(--gold)' }}>+1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(212,175,55,0.2)', color: 'var(--text-muted)' }}>
                      <span>Legacy Scrums / Lineouts</span><span>Won: +1.0 | Lost: -1.0</span>
                    </li>
                  </ul>
                </div>

                {/* Individual Gameplay */}
                <div style={{ padding: '22px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Zap size={16} color="#60A5FA" />
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60A5FA', margin: 0 }}>
                      INDIVIDUAL GAMEPLAY &amp; CARRYING
                    </h4>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Try Assist</span><strong style={{ color: 'var(--neon)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tackles Completed</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt / 5 tackles</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ball Metres Carried</span><strong style={{ color: 'var(--neon)' }}>+0.5 pt / 5 metres</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Clean Break (Linebreak)</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Defenders Beaten</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt / 2 beaten</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Turnover Won (Ruck/Maul)</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Opposition Lineout Steal (Indiv.)</span><strong style={{ color: 'var(--neon)' }}>+1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>50:22 Territorial Kick</span><strong style={{ color: 'var(--gold)' }}>+2.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Player of the Match (POTM)</span><strong style={{ color: 'var(--gold)' }}>+3.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                      <span>Legacy Carries</span><span>+0.5 pt / carry</span>
                    </li>
                  </ul>
                </div>

                {/* Discipline & Deductions */}
                <div style={{ padding: '22px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <AlertCircle size={16} color="#F87171" />
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F87171', margin: 0 }}>
                      DISCIPLINE &amp; DEDUCTIONS
                    </h4>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Missed Tackle</span><strong style={{ color: '#F87171' }}>-0.5 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Handling Error / Knock-on</span><strong style={{ color: '#F87171' }}>-0.5 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Penalty Conceded</span><strong style={{ color: '#F87171' }}>-1.0 pt</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Yellow Card (Sin Bin — 10 min)</span><strong style={{ color: '#F87171' }}>-4.0 pts</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Red Card (Sent Off)</span><strong style={{ color: '#F87171' }}>-8.0 pts</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: TACTICAL BOOSTERS ──────────────────────────────────── */}
          {activeTab === 'boosters' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={20} color="#C084FC" />
                </div>
                <div>
                  <h3 className="font-condensed" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#FFF' }}>
                    TACTICAL CHIPS &amp; BOOSTERS
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Deploy your 4 single-use strategic boosters to surge ahead in mini-leagues.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontWeight: 900, fontSize: '11px', marginBottom: '12px' }}>
                    3×C · TRIPLE CAPTAIN
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', margin: '0 0 8px' }}>
                    Triple Captain
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    Your designated Captain scores <strong>3× points</strong> instead of standard 2× double points. Ideal when your talisman has a favorable derby matchup.
                  </p>
                </div>

                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', color: '#A855F7', fontWeight: 900, fontSize: '11px', marginBottom: '12px' }}>
                    LIM · LIMITLESS
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', margin: '0 0 8px' }}>
                    Limitless Squad
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    The <strong>KES 150M budget cap is completely lifted</strong> for the round. Field the most expensive all-star squad possible with zero financial limitations.
                  </p>
                </div>

                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', fontWeight: 900, fontSize: '11px', marginBottom: '12px' }}>
                    CO-C · CO-CAPTAINS
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', margin: '0 0 8px' }}>
                    Co-Captains
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    Both your <strong>Captain AND Vice-Captain score 2× double points</strong>. Requires both players to be designated to activate.
                  </p>
                </div>

                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 900, fontSize: '11px', marginBottom: '12px' }}>
                    BB · BENCH BOOST
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', margin: '0 0 8px' }}>
                    Bench Boost
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    Normally bench players score 0. With Bench Boost active, <strong>all 8 substitute reserves score fantasy points</strong> for your total round score!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: LEAGUES & ARCHITECTURE ─────────────────────────────── */}
          {activeTab === 'leagues' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={20} color="var(--gold)" />
                </div>
                <div>
                  <h3 className="font-condensed" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#FFF' }}>
                    SINGLE TEAM, MULTIPLE LEAGUES
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Compete everywhere with one unified manager squad.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
                    <Globe size={18} /> Global Kenya Cup Leaderboard
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    Every manager who creates a squad is automatically enrolled into the official <strong>Overall Kenya Cup Leaderboard</strong>. Compete against thousands of rugby fans nationwide for the ultimate fantasy championship.
                  </p>
                </div>

                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
                    <Lock size={18} /> Private Mini-Leagues
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    Create custom leagues for your friends, club supporters, or coworkers. Every private league gets a unique <strong>6-character alphanumeric invite code</strong> (e.g. <code>KC1337</code>).
                  </p>
                </div>

                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(57, 255, 20, 0.04)', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon)', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
                    <Sparkles size={18} /> Unified Score Mirroring
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    You never have to manage separate squads for different leagues. Your single 23-man squad mirrors its round points into <strong>all private and public leagues simultaneously</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

