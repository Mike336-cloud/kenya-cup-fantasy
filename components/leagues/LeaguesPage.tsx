'use client';
import { useState, useEffect, useTransition } from 'react';
import {
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  Globe,
  Lock,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLeagueStore, GLOBAL_LEAGUE_ID } from '@/lib/leagueStore';
import { useAuth } from '@/components/auth/AuthProvider';

function RankIcon({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--success)', fontSize: '12px', fontWeight: 700 }}>
        <ArrowUp size={12} />+{change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--danger)', fontSize: '12px', fontWeight: 700 }}>
        <ArrowDown size={12} />{change}
      </span>
    );
  }
  return <span style={{ color: 'var(--text-muted)' }}><Minus size={12} /></span>;
}

export function LeaguesPage() {
  const {
    leagues,
    activeLeagueId,
    setActiveLeague,
    getActiveLeague,
    createLeague,
    joinLeague,
    searchLeagueByCode,
    searchResult,
    isSearching,
    searchError,
    clearSearch,
    fetchUserLeagues,
  } = useLeagueStore();

  const { email, avatarUrl } = useAuth();
  const [tab, setTab] = useState<'standings' | 'create' | 'join'>('standings');
  const [leagueName, setLeagueName] = useState('');
  const [leagueType, setLeagueType] = useState<'private' | 'public'>('private');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const defaultTeamName = email ? `${email.split('@')[0]}'s XV` : 'My Kenya Cup XV';

  // Fetch leagues on mount
  useEffect(() => {
    fetchUserLeagues('me');
  }, [fetchUserLeagues]);

  // Real-time debounced live search as user types in the Join Code input
  useEffect(() => {
    const clean = joinCode.trim().toUpperCase();
    if (clean.length >= 3) {
      const timer = setTimeout(() => {
        searchLeagueByCode(clean);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      clearSearch();
    }
  }, [joinCode, searchLeagueByCode, clearSearch]);

  const activeLeague = getActiveLeague() || leagues[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueName.trim()) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const result = await createLeague(leagueName.trim(), leagueType, defaultTeamName);
    setIsSubmitting(false);

    if (result.success && result.league) {
      setLeagueName('');
      setActionSuccess(`League "${result.league.name}" created! Your team is automatically enrolled.`);
      startTransition(() => {
        setTab('standings');
      });
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(result.error || 'Failed to create league.');
    }
  };

  const handleJoinLeague = async (codeToJoin?: string) => {
    const code = (codeToJoin || joinCode).trim().toUpperCase();
    if (!code) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const result = await joinLeague(code, defaultTeamName);
    setIsSubmitting(false);

    if (result.success && result.league) {
      setJoinCode('');
      clearSearch();
      setActionSuccess(`Successfully joined "${result.league.name}"! Your single team points are now mirrored.`);
      startTransition(() => {
        setTab('standings');
      });
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(result.error || 'Failed to join league.');
    }
  };

  const isAlreadyMemberOfFound = searchResult
    ? searchResult.members.some(m => m.userId === 'me') || leagues.some(l => l.id === searchResult.id)
    : false;

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '36px 24px 80px' }}>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '100px', marginBottom: '12px' }}>
            <Sparkles size={12} color="var(--gold)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Single Team · Multi-League Architecture
            </span>
          </div>
          <h1 className="font-condensed" style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1, margin: 0, color: '#FFF' }}>
            KENYA CUP LEAGUES
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            One squad mirrors points across the global leaderboard and all private mini-leagues.
          </p>
        </div>

        {/* Global Action feedback banner */}
        {actionSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ADE80', fontSize: '13px', fontWeight: 600,
          }}>
            <CheckCircle2 size={16} />
            {actionSuccess}
          </div>
        )}
      </div>

      {/* ── League Switcher Bar ────────────────────────────────────────────── */}
      <div style={{
        marginBottom: '28px',
        padding: '8px',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 0 12px', whiteSpace: 'nowrap' }}>
          My Leagues:
        </span>

        {leagues.map(l => {
          const isSelected = l.id === activeLeagueId;
          const isGlobal = l.id === GLOBAL_LEAGUE_ID;
          const myEntry = l.members.find(m => m.userId === 'me');

          return (
            <button
              key={l.id}
              onClick={() => {
                setActiveLeague(l.id);
                setTab('standings');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: isSelected ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {isGlobal ? <Globe size={14} color={isSelected ? 'var(--gold)' : 'var(--text-muted)'} /> : <Lock size={14} color={isSelected ? 'var(--gold)' : 'var(--text-muted)'} />}
              <span>{l.name}</span>
              {myEntry && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '100px',
                  background: isSelected ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isSelected ? '#FFF' : 'var(--text-muted)',
                }}>
                  Rank #{myEntry.rank}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => setTab('join')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px dashed rgba(59, 130, 246, 0.35)',
            background: 'rgba(59, 130, 246, 0.06)',
            color: '#93C5FD',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <LogIn size={13} /> Join via Code
        </button>

        <button
          onClick={() => setTab('create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px dashed rgba(212, 175, 55, 0.35)',
            background: 'rgba(212, 175, 55, 0.06)',
            color: 'var(--gold)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={13} /> Create League
        </button>
      </div>

      {/* ── Main Navigation Tabs ───────────────────────────────────────────── */}
      <div className="tab-bar" style={{ marginBottom: '28px', maxWidth: '440px' }}>
        {(['standings', 'create', 'join'] as const).map(t => (
          <button
            key={t}
            className={`tab-item ${tab === t ? 'active' : ''}`}
            onClick={() => {
              setTab(t);
              setActionError(null);
            }}
            style={{ textTransform: 'capitalize' }}
          >
            {t === 'standings' ? '📊 Standings' : t === 'create' ? '➕ Create Mini-League' : '🔗 Join with Code'}
          </button>
        ))}
      </div>

      {/* ── TAB 1: STANDINGS ──────────────────────────────────────────────── */}
      {tab === 'standings' && (
        <div>
          {/* Active League Hero Card */}
          <div className="card-gold" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  padding: '3px 8px', borderRadius: '6px',
                  background: activeLeague.type === 'public' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                  border: `1px solid ${activeLeague.type === 'public' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: activeLeague.type === 'public' ? '#60A5FA' : 'var(--gold)',
                }}>
                  {activeLeague.type === 'public' ? '🌐 Public League' : '🔒 Private League'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Season {activeLeague.season || '26/27'} · {activeLeague.members.length} Managers
                </span>
              </div>

              <h2 className="font-condensed" style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', margin: '0 0 6px' }}>
                {activeLeague.name}
              </h2>

              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Your team score automatically mirrors here. All Kenya Cup managers play with one unified squad.
              </p>
            </div>

            {/* Invite code badge if private */}
            {activeLeague.type === 'private' && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Invite Code
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 900, letterSpacing: '0.12em', color: 'var(--gold)' }}>
                    {activeLeague.code}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCode(activeLeague.code)}
                  className="btn btn-outline"
                  style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <><Check size={14} color="#4ADE80" /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            )}
          </div>

          {/* Standings Table */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Team & Manager', 'GW Points', 'Total Points', 'Trend'].map(h => (
                    <th key={h} style={{
                      padding: '14px 20px', fontSize: '11px', fontWeight: 700,
                      color: 'var(--text-muted)', textAlign: h.startsWith('Team') ? 'left' : 'center',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeLeague.members.map((m, i) => {
                  const isMe = m.userId === 'me';
                  const isGold = m.rank === 1;
                  const isSilver = m.rank === 2;
                  const isBronze = m.rank === 3;

                  return (
                    <tr
                      key={`${m.userId}-${i}`}
                      style={{
                        borderBottom: i < activeLeague.members.length - 1 ? '1px solid var(--border)' : 'none',
                        background: isMe ? 'rgba(212,175,55,0.08)' : isGold ? 'rgba(212,175,55,0.03)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => !isMe && (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isMe ? 'rgba(212,175,55,0.08)' : isGold ? 'rgba(212,175,55,0.03)' : 'transparent')}
                    >
                      {/* Rank Column with Podium styling */}
                      <td style={{ padding: '16px 20px', textAlign: 'center', width: '68px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', margin: '0 auto',
                          background: isGold
                            ? 'linear-gradient(135deg, #A8891C, #D4AF37)'
                            : isSilver
                            ? 'linear-gradient(135deg, #64748B, #94A3B8)'
                            : isBronze
                            ? 'linear-gradient(135deg, #78350F, #B45309)'
                            : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: m.rank <= 3 ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                          boxShadow: isGold ? '0 0 12px rgba(212,175,55,0.35)' : 'none',
                        }}>
                          <span className="font-condensed" style={{
                            fontSize: '15px', fontWeight: 800,
                            color: m.rank <= 3 ? '#000' : 'var(--text-secondary)',
                          }}>
                            {m.rank}
                          </span>
                        </div>
                      </td>

                      {/* Team Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isGold && <Trophy size={16} color="var(--gold)" />}
                          
                          {/* Manager Avatar */}
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: 'rgba(212,175,55,0.12)',
                            border: isMe ? '1.5px solid var(--gold)' : '1px solid rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {(isMe ? (avatarUrl || m.avatarUrl || m.avatar_url) : (m.avatarUrl || m.avatar_url)) ? (
                              <img
                                src={(isMe ? (avatarUrl || m.avatarUrl || m.avatar_url) : (m.avatarUrl || m.avatar_url))!}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '15px' }}>🏉</span>
                            )}
                          </div>

                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: isMe ? 800 : 600,
                              color: isMe ? 'var(--gold)' : '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}>
                              {m.teamName}
                              {isMe && (
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '100px',
                                  background: 'rgba(212, 175, 55, 0.2)',
                                  border: '1px solid rgba(212, 175, 55, 0.4)',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  color: 'var(--gold)',
                                }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Manager: {isMe ? (email || 'You') : `Kenya Cup Fan #${m.userId}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* GW Points */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--neon)' }}>
                          {m.gameweekPoints}
                        </span>
                      </td>

                      {/* Total Points */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span className="font-condensed" style={{ fontSize: '22px', fontWeight: 800, color: '#FFF' }}>
                          {m.totalPoints}
                        </span>
                      </td>

                      {/* Rank Change */}
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

      {/* ── TAB 2: CREATE MINI-LEAGUE ─────────────────────────────────────── */}
      {tab === 'create' && (
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '36px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Plus size={22} color="var(--gold)" />
              </div>
              <h2 className="font-condensed" style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: '#FFF' }}>
                CREATE A MINI-LEAGUE
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                Set up a league for your club fan club, coworkers, or rugby crew. A unique 6-character private invite code will be automatically generated.
              </p>
            </div>

            {actionError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontSize: '13px', marginBottom: '20px' }}>
                <AlertCircle size={16} />
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateLeague}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  League Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Kabras Ultras XV, Ngong Road Elite"
                  value={leagueName}
                  onChange={e => setLeagueName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Privacy Setting
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setLeagueType('private')}
                    style={{
                      padding: '14px',
                      background: leagueType === 'private' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${leagueType === 'private' ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: '10px',
                      color: leagueType === 'private' ? 'var(--gold)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🔒 Private</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>Requires 6-char code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeagueType('public')}
                    style={{
                      padding: '14px',
                      background: leagueType === 'public' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${leagueType === 'public' ? '#60A5FA' : 'var(--border)'}`,
                      borderRadius: '10px',
                      color: leagueType === 'public' ? '#93C5FD' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🌐 Public</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>Open to all fans</span>
                  </button>
                </div>
              </div>

              {/* Informative message */}
              <div style={{
                padding: '14px',
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '10px',
                marginBottom: '24px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                🏉 <strong>Single Team Architecture:</strong> Your existing 23-man matchday squad automatically scores points in this league. You do not need to manage a separate team.
              </div>

              <button
                type="submit"
                className="btn btn-gold"
                style={{ width: '100%', padding: '14px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={!leagueName.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
                Create &amp; Enter League
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: JOIN LEAGUE (REAL-TIME LIVE CODE FILTERING) ─────────────── */}
      {tab === 'join' && (
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '36px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <LogIn size={22} color="#3B82F6" />
              </div>
              <h2 className="font-condensed" style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: '#FFF' }}>
                JOIN A MINI-LEAGUE
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                Type the 6-character private invite code provided by your league creator. As you type, we will automatically match and verify the league.
              </p>
            </div>

            {actionError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontSize: '13px', marginBottom: '20px' }}>
                <AlertCircle size={16} />
                {actionError}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                6-Character Invite Code
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  placeholder="e.g. KC1337"
                  value={joinCode}
                  maxLength={6}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                  autoFocus
                />

                {isSearching && (
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={20} className="animate-spin" color="var(--gold)" />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                {joinCode.length < 3
                  ? 'Enter at least 3 characters to search'
                  : isSearching
                  ? 'Verifying league code with server...'
                  : `${joinCode.length}/6 characters`}
              </div>
            </div>

            {/* REAL-TIME MATCH PREVIEW CARD */}
            {searchResult && (
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                marginBottom: '24px',
                animation: 'fadeIn 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <CheckCircle2 size={18} color="#4ADE80" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    League Found
                  </span>
                </div>

                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
                  {searchResult.name}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {searchResult.type === 'private' ? '🔒 Private Mini-League' : '🌐 Public League'} · {searchResult.members.length} members
                </div>

                {isAlreadyMemberOfFound ? (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    color: 'var(--gold)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    ✓ You are already a member of this league.
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinLeague(searchResult.code)}
                    disabled={isSubmitting}
                    className="btn btn-gold"
                    style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                    Join {searchResult.name}
                  </button>
                )}
              </div>
            )}

            {/* Error when code is full length but not found */}
            {searchError && joinCode.length >= 4 && !searchResult && !isSearching && (
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#F87171',
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: '20px',
              }}>
                <AlertCircle size={18} style={{ margin: '0 auto 6px' }} />
                <div>{searchError}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Please check the invite code with your league admin and try again.
                </div>
              </div>
            )}

            {/* Quick action button for join */}
            <button
              onClick={() => handleJoinLeague()}
              className="btn"
              style={{
                width: '100%',
                padding: '14px',
                background: joinCode.length >= 4 ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${joinCode.length >= 4 ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                color: joinCode.length >= 4 ? '#93C5FD' : 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: joinCode.length >= 4 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              disabled={joinCode.length < 4 || isSubmitting}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
              Join League
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
