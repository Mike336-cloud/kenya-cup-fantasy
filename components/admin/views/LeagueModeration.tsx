'use client';
import { useState } from 'react';
import { Trash2, UserX, Search, Shield, AlertTriangle } from 'lucide-react';
import { MOCK_LEAGUE_MEMBERS } from '@/lib/mockData';

interface MockLeague {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private';
  memberCount: number;
  members: typeof MOCK_LEAGUE_MEMBERS;
  flagged: boolean;
}

const MOCK_LEAGUES: MockLeague[] = [
  { id: 'l1', name: 'Nairobi Fantasy Elite', code: 'KC1337', type: 'private', memberCount: 8,  members: MOCK_LEAGUE_MEMBERS, flagged: false },
  { id: 'l2', name: 'Savannah Rugby Masters', code: 'SRM456', type: 'public',  memberCount: 24, members: MOCK_LEAGUE_MEMBERS.slice(0, 5), flagged: false },
  { id: 'l3', name: 'Office Fantasy XV', code: 'OFF789', type: 'private', memberCount: 12, members: MOCK_LEAGUE_MEMBERS.slice(0, 4), flagged: false },
  { id: 'l4', name: '⚠️ Flagged League Name', code: 'BAD000', type: 'public',  memberCount: 3,  members: MOCK_LEAGUE_MEMBERS.slice(0, 3), flagged: true },
];

type ConfirmAction =
  | { type: 'delete-league'; league: MockLeague }
  | { type: 'remove-user'; leagueId: string; userId: string; teamName: string };

export function LeagueModeration() {
  const [leagues, setLeagues] = useState<MockLeague[]>(MOCK_LEAGUES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = leagues.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteLeague = (league: MockLeague) => {
    // In production: await supabase.from('leagues').delete().eq('id', league.id)
    setLeagues(prev => prev.filter(l => l.id !== league.id));
    showToast(`✓ League "${league.name}" permanently deleted`);
    setConfirm(null);
  };

  const handleRemoveUser = (leagueId: string, userId: string) => {
    // In production: await supabase.from('league_members').delete().eq('leagueId', leagueId).eq('userId', userId)
    setLeagues(prev => prev.map(l =>
      l.id === leagueId
        ? { ...l, members: l.members.filter(m => m.userId !== userId), memberCount: l.memberCount - 1 }
        : l
    ));
    showToast('✓ User removed from league');
    setConfirm(null);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 300,
          padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
          color: '#34D399', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ padding: '28px', maxWidth: '420px', width: '100%', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {confirm.type === 'delete-league' ? 'Delete League' : 'Remove User'}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {confirm.type === 'delete-league'
                ? <>Permanently delete <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{confirm.league.name}&rdquo;</strong>? All member records will be removed. This cannot be undone.</>
                : <>Remove <strong style={{ color: 'var(--text-primary)' }}>{confirm.teamName}</strong> from this league? They can rejoin with the invite code.</>
              }
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} className="btn btn-outline">Cancel</button>
              <button
                onClick={() => {
                  if (confirm.type === 'delete-league') handleDeleteLeague(confirm.league);
                  else handleRemoveUser(confirm.leagueId, confirm.userId);
                }}
                className="btn btn-danger"
              >
                <Trash2 size={13} /> {confirm.type === 'delete-league' ? 'Delete League' : 'Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '20px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" placeholder="Search leagues…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
      </div>

      {/* League cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(league => {
          const expanded = expandedId === league.id;
          return (
            <div key={league.id} className="card" style={{
              padding: '0', overflow: 'hidden',
              border: league.flagged ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
              background: league.flagged ? 'rgba(239,68,68,0.03)' : 'var(--bg-card)',
            }}>
              {/* League header row */}
              <div style={{
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                cursor: 'pointer',
              }} onClick={() => setExpandedId(expanded ? null : league.id)}>
                {/* Icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  background: league.flagged ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.1)',
                  border: `1px solid ${league.flagged ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={16} color={league.flagged ? '#F87171' : 'var(--gold)'} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{league.name}</span>
                    <span className={`badge ${league.type === 'public' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '9px' }}>
                      {league.type.toUpperCase()}
                    </span>
                    {league.flagged && <span className="badge badge-red" style={{ fontSize: '9px' }}>⚠️ FLAGGED</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Code: <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 700 }}>{league.code}</code>
                    &nbsp;·&nbsp; {league.memberCount} members
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirm({ type: 'delete-league', league }); }}
                    title="Hard-delete league"
                    style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '7px', cursor: 'pointer', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600 }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', userSelect: 'none' }}>
                    {expanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded member list */}
              {expanded && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <div style={{ padding: '10px 20px', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Members
                    </span>
                  </div>
                  {league.members.map((member, idx) => (
                    <div key={member.userId} style={{
                      padding: '12px 20px',
                      borderBottom: idx < league.members.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: member.rank <= 3 ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0 }}>
                        {member.rank}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{member.teamName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.totalPoints} pts total</div>
                      </div>
                      <button
                        onClick={() => setConfirm({ type: 'remove-user', leagueId: league.id, userId: member.userId, teamName: member.teamName })}
                        title="Remove from league"
                        style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                      >
                        <UserX size={11} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Production:</strong> Delete calls <code>supabase.from(&apos;leagues&apos;).delete()</code>. Remove user calls <code>supabase.from(&apos;league_members&apos;).delete()</code>. Both are hard-deletes per spec.
      </div>
    </div>
  );
}
