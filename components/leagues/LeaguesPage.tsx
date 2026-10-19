'use client';
import { useState } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus, Users, Plus, LogIn, Copy, Check } from 'lucide-react';
import { MOCK_LEAGUE_MEMBERS } from '@/lib/mockData';

function RankIcon({ change }: { change: number }) {
  if (change > 0) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--success)', fontSize: '12px', fontWeight: 700 }}><ArrowUp size={11} />+{change}</span>;
  if (change < 0) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--danger)', fontSize: '12px', fontWeight: 700 }}><ArrowDown size={11} />{change}</span>;
  return <span style={{ color: 'var(--text-muted)' }}><Minus size={11} /></span>;
}

export function LeaguesPage() {
  const [tab, setTab] = useState<'standings' | 'create' | 'join'>('standings');
  const [leagueName, setLeagueName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const myLeagueCode = 'KC1337';

  const handleCopy = () => {
    navigator.clipboard.writeText(myLeagueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-condensed" style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>
          Leagues
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Compete with friends in private mini-leagues</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '24px', maxWidth: '400px' }}>
        {(['standings', 'create', 'join'] as const).map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}
            style={{ textTransform: 'capitalize' }}>
            {t === 'standings' ? '📊 Standings' : t === 'create' ? '➕ Create' : '🔗 Join'}
          </button>
        ))}
      </div>

      {tab === 'standings' && (
        <div>
          {/* League header */}
          <div className="card-gold" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                My Private League
              </div>
              <h2 className="font-condensed" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gold)' }}>
                🏆 Nairobi Fantasy Elite
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {MOCK_LEAGUE_MEMBERS.length} members · Season 26/27
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 14px', fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
                {myLeagueCode}
              </div>
              <button onClick={handleCopy} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Standings table */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Team', 'GW Pts', 'Total', 'Change'].map(h => (
                    <th key={h} style={{
                      padding: '14px 20px', fontSize: '11px', fontWeight: 700,
                      color: 'var(--text-muted)', textAlign: h === 'Team' ? 'left' : 'center',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_LEAGUE_MEMBERS.map((m, i) => {
                  const isMe = m.userId === 'me';
                  const rankBg = m.rank === 1 ? 'rgba(212,175,55,0.15)' : m.rank === 2 ? 'rgba(148,163,184,0.08)' : m.rank === 3 ? 'rgba(180,83,9,0.08)' : 'transparent';
                  const rankColor = m.rank === 1 ? 'var(--gold)' : m.rank <= 3 ? 'var(--text-primary)' : 'var(--text-muted)';

                  return (
                    <tr key={m.userId} style={{
                      borderBottom: i < MOCK_LEAGUE_MEMBERS.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isMe ? 'rgba(212,175,55,0.06)' : rankBg,
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => !isMe && (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isMe ? 'rgba(212,175,55,0.06)' : rankBg)}
                    >
                      {/* Rank */}
                      <td style={{ padding: '16px 20px', textAlign: 'center', width: '60px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto',
                          background: m.rank === 1 ? 'linear-gradient(135deg, #A8891C, #D4AF37)' : 'var(--bg-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: m.rank <= 3 ? `1px solid ${m.rank === 1 ? 'var(--gold)' : 'var(--border-light)'}` : 'none',
                        }}>
                          <span className="font-condensed" style={{ fontSize: '15px', fontWeight: 800, color: m.rank === 1 ? '#000' : rankColor }}>
                            {m.rank}
                          </span>
                        </div>
                      </td>

                      {/* Team */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {m.rank === 1 && <Trophy size={14} color="var(--gold)" />}
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--gold)' : 'var(--text-primary)' }}>
                              {m.teamName}
                            </div>
                            {isMe && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>← You</div>}
                          </div>
                        </div>
                      </td>

                      {/* GW Points */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--neon)' }}>
                          {m.gameweekPoints}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {m.totalPoints}
                        </span>
                      </td>

                      {/* Change */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <RankIcon change={m.rankChange} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div className="card" style={{ padding: '32px', maxWidth: '480px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Plus size={20} color="var(--gold)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Create a Private League</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Set up a league and share the code with friends.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              League Name
            </label>
            <input className="input" placeholder="e.g. Office Fantasy XV" value={leagueName} onChange={e => setLeagueName(e.target.value)} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              League Type
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Private', 'Public'].map(type => (
                <button key={type} style={{
                  flex: 1, padding: '12px',
                  background: type === 'Private' ? 'rgba(212,175,55,0.1)' : 'transparent',
                  border: `1px solid ${type === 'Private' ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: '8px', color: type === 'Private' ? 'var(--gold)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {type === 'Private' ? '🔒' : '🌐'} {type}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-gold" style={{ width: '100%', padding: '14px' }} disabled={!leagueName}>
            <Trophy size={16} /> Create League
          </button>
        </div>
      )}

      {tab === 'join' && (
        <div className="card" style={{ padding: '32px', maxWidth: '480px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LogIn size={20} color="#3B82F6" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Join a League</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Enter the 6-character invite code shared by a friend.</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Invite Code
            </label>
            <input
              className="input"
              placeholder="e.g. KC1337"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center' }}
            />
          </div>

          <button className="btn" style={{ width: '100%', padding: '14px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#93C5FD', fontSize: '14px', fontWeight: 700 }} disabled={joinCode.length < 4}>
            <Users size={16} /> Join League
          </button>
        </div>
      )}
    </div>
  );
}
