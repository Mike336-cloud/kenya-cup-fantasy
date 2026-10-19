'use client';
import { Clock, TrendingUp, Trophy, Users, ArrowUp, ArrowDown, Minus, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { CURRENT_GAMEWEEK, MOCK_FIXTURES, MOCK_PLAYERS, MOCK_LEAGUE_MEMBERS, CLUB_META } from '@/lib/mockData';
import { getDeadlineCountdown } from '@/lib/fantasyRules';
import { useSquadStore } from '@/store/squadStore';

export function DashboardPage() {
  const { getRemainingBudget } = useSquadStore();
  const countdown = getDeadlineCountdown(CURRENT_GAMEWEEK.deadlineTime);

  const topScorers = [...MOCK_PLAYERS]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const myTeam = MOCK_LEAGUE_MEMBERS.find(m => m.userId === 'me')!;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(212,175,55,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-green">● LIVE</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Season 26/27</span>
            </div>
            <h1 className="font-condensed" style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 800, lineHeight: 1,
              background: 'linear-gradient(135deg, #F0F4FF 0%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              ROUND {CURRENT_GAMEWEEK.number}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Kenya Cup Fantasy Rugby — build your dream XV
            </p>
          </div>

          {/* Deadline countdown */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '14px',
            padding: '20px 24px',
            textAlign: 'center',
            minWidth: '180px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
              <Clock size={14} color="var(--gold)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                DEADLINE
              </span>
            </div>
            <div className="font-condensed" style={{
              fontSize: '32px', fontWeight: 800,
              background: 'linear-gradient(135deg, #D4AF37, #F0CF6E)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              {countdown}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Fri 2 Oct · 18:00 EAT
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <Link href="/squad" className="btn btn-gold" style={{ fontSize: '14px' }}>
            <Users size={16} />
            Manage Squad
          </Link>
          <Link href="/players" className="btn btn-outline" style={{ fontSize: '14px' }}>
            <Zap size={16} />
            Browse Players
          </Link>
        </div>
      </div>

      {/* ── Stat Cards Row ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'GW Points',    value: myTeam.gameweekPoints.toString(), icon: TrendingUp, color: 'var(--gold)',    sub: `Round ${CURRENT_GAMEWEEK.number}` },
          { label: 'Total Points', value: myTeam.totalPoints.toString(),    icon: Trophy,     color: '#8B5CF6', sub: 'Season 26/27' },
          { label: 'Overall Rank', value: `#${myTeam.rank}`,                icon: Users,      color: '#3B82F6', sub: '↑ 2 this week' },
          { label: 'Budget Left',  value: `${(getRemainingBudget() / 1_000_000).toFixed(1)}M`, icon: Zap, color: 'var(--neon)', sub: 'KES remaining' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
              </span>
              <div style={{ padding: '6px', background: `${color}18`, borderRadius: '8px' }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div className="font-condensed" style={{ fontSize: '32px', fontWeight: 800, color, lineHeight: 1, marginBottom: '4px' }}>
              {value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Fixtures */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Round 4 Fixtures
            </h2>
            <span className="badge badge-green">● Live</span>
          </div>
          <div>
            {MOCK_FIXTURES.map((f, i) => {
              const homeMeta = CLUB_META[f.homeClub];
              const awayMeta = CLUB_META[f.awayClub];
              const time = new Date(f.kickoffTime).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              return (
                <div key={f.id} style={{
                  padding: '14px 20px',
                  borderBottom: i < MOCK_FIXTURES.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      color: homeMeta.color, background: homeMeta.bg,
                      padding: '2px 6px', borderRadius: '4px',
                    }}>{homeMeta.abbr}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{f.homeClub}</span>
                  </div>
                  <div style={{ padding: '4px 10px', background: 'var(--bg-surface)', borderRadius: '6px', margin: '0 10px', textAlign: 'center', minWidth: '72px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>VS</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '1px' }}>{time}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{f.awayClub}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      color: awayMeta.color, background: awayMeta.bg,
                      padding: '2px 6px', borderRadius: '4px',
                    }}>{awayMeta.abbr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Scorers */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Top Performers</h2>
            <Link href="/players" style={{ fontSize: '12px', color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div>
            {topScorers.map((p, i) => {
              const clubMeta = CLUB_META[p.club];
              return (
                <div key={p.id} style={{
                  padding: '12px 20px',
                  borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i === 0 ? 'linear-gradient(135deg, #A8891C, #D4AF37)' : 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700,
                    color: i === 0 ? '#000' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '1px 5px', borderRadius: '3px' }}>
                        {clubMeta.abbr}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.position}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-condensed" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
                      {p.totalPoints}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini-league preview */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700 }}>My League — Round 4 Standings</h2>
            <Link href="/leagues" style={{ fontSize: '12px', color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Full table <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Rank', 'Team', 'GW Pts', 'Total', '±'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Team' ? 'left' : 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_LEAGUE_MEMBERS.slice(0, 5).map((m, i) => {
                  const isMe = m.userId === 'me';
                  return (
                    <tr key={m.userId} style={{
                      borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      background: isMe ? 'rgba(212,175,55,0.05)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => !isMe && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => !isMe && (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '18px', fontWeight: 800, color: m.rank <= 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
                          {m.rank}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '13px', fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--gold)' : 'var(--text-primary)' }}>
                          {m.teamName} {isMe && '(You)'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--neon)' }}>{m.gameweekPoints}</span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.totalPoints}</span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        {m.rankChange > 0
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--success)', fontSize: '12px', fontWeight: 700 }}><ArrowUp size={12} />+{m.rankChange}</span>
                          : m.rankChange < 0
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--danger)', fontSize: '12px', fontWeight: 700 }}><ArrowDown size={12} />{m.rankChange}</span>
                          : <span style={{ color: 'var(--text-muted)' }}><Minus size={12} /></span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
