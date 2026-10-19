'use client';
import { useState } from 'react';
import { Clock, Pencil, PauseCircle, PlayCircle, Check, AlertTriangle } from 'lucide-react';
import { MOCK_FIXTURES, CLUB_META } from '@/lib/mockData';
import { Fixture } from '@/types/fantasy';

type MutableFixture = Fixture & { isPostponed: boolean };

function formatLocal(iso: string) {
  return new Date(iso).toLocaleString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

function EditKickoffModal({ fixture, onClose, onSave }: {
  fixture: MutableFixture;
  onClose: () => void;
  onSave: (id: string, newTime: string) => void;
}) {
  const [dt, setDt] = useState(fixture.kickoffTime.slice(0, 16));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ padding: '28px', maxWidth: '440px', width: '100%' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
          Override Kickoff Time
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {fixture.homeClub} vs {fixture.awayClub}
        </p>

        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          New Kickoff Date & Time
        </label>
        <input className="input" type="datetime-local" value={dt} onChange={e => setDt(e.target.value)}
          style={{ marginBottom: '20px' }} />

        <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '12px', color: '#FCD34D', marginBottom: '20px', display: 'flex', gap: '8px' }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          This will update the lockout time for all players in these two clubs.
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
          <button onClick={() => { onSave(fixture.id, new Date(dt).toISOString()); onClose(); }} className="btn btn-gold">
            <Check size={14} /> Apply Override
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixture Controller (View B)
// ─────────────────────────────────────────────────────────────────────────────
export function FixtureController() {
  const [fixtures, setFixtures] = useState<MutableFixture[]>(
    MOCK_FIXTURES.map(f => ({ ...f, isPostponed: false }))
  );
  const [editFixture, setEditFixture] = useState<MutableFixture | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const now = new Date();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleKickoffSave = (id: string, newTime: string) => {
    setFixtures(prev => prev.map(f => f.id === id ? { ...f, kickoffTime: newTime } : f));
    showToast('✓ Kickoff time updated — player lockouts recalculated');
  };

  const handlePostponeToggle = (id: string) => {
    setFixtures(prev => prev.map(f => {
      if (f.id !== id) return f;
      const next = { ...f, isPostponed: !f.isPostponed };
      showToast(next.isPostponed
        ? `⏸ ${f.homeClub} vs ${f.awayClub} postponed — lockouts lifted`
        : `▶ ${f.homeClub} vs ${f.awayClub} reinstated`
      );
      return next;
    }));
    // In production: 
    // await supabase.from('fixtures').update({ isPostponed: newVal }).eq('id', id)
    // await supabase.from('players').update({ matchKickoffTime: FAR_FUTURE }).in('club', [homeClub, awayClub])
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

      {/* Simulated current time */}
      <div style={{
        padding: '16px 20px', marginBottom: '20px',
        background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)',
        borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Clock size={16} color="var(--neon)" />
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Simulated Current Time</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neon)' }}>{now.toLocaleString('en-KE')}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          Lockout triggers when kickoffTime ≤ now
        </div>
      </div>

      {/* Fixtures table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: '16px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Round 4 Fixtures — Kickoff & Lockout Control</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              {['Match', 'Kickoff Time', 'Status', 'Lockout Active', 'Postponed', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Match' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fixtures.map((f, i) => {
              const homeMeta = CLUB_META[f.homeClub];
              const awayMeta = CLUB_META[f.awayClub];
              const isLocked = new Date(f.kickoffTime) <= now && !f.isPostponed;
              const isPast   = new Date(f.kickoffTime) < now;

              return (
                <tr key={f.id} style={{
                  borderBottom: i < fixtures.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: f.isPostponed ? 0.6 : 1,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Match */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: homeMeta.color, background: homeMeta.bg, padding: '2px 6px', borderRadius: '4px' }}>{homeMeta.abbr}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>vs</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: awayMeta.color, background: awayMeta.bg, padding: '2px 6px', borderRadius: '4px' }}>{awayMeta.abbr}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{f.venue}</div>
                  </td>

                  {/* Kickoff */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatLocal(f.kickoffTime)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span className={`badge ${f.isPostponed ? 'badge-red' : isPast ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '9px' }}>
                      {f.isPostponed ? 'POSTPONED' : isPast ? 'COMPLETED' : 'SCHEDULED'}
                    </span>
                  </td>

                  {/* Lockout */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isLocked ? 'var(--danger)' : 'var(--success)' }}>
                      {isLocked ? '🔒 YES' : '🔓 NO'}
                    </span>
                  </td>

                  {/* Postpone toggle */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => handlePostponeToggle(f.id)}
                      title={f.isPostponed ? 'Reinstate match' : 'Postpone match'}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600,
                        background: f.isPostponed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: f.isPostponed ? '#34D399' : '#FCA5A5',
                      }}>
                      {f.isPostponed
                        ? <><PlayCircle size={12} /> Reinstate</>
                        : <><PauseCircle size={12} /> Postpone</>
                      }
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => setEditFixture(f)}
                      title="Edit kickoff time"
                      style={{ padding: '6px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                      <Pencil size={12} /> Edit Time
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Production:</strong> Kickoff overrides call <code>supabase.from(&apos;fixtures&apos;).update()</code> and cascade to update <code>players.matchKickoffTime</code> for affected clubs, which Zustand reads for lockout state.
      </div>

      {editFixture && (
        <EditKickoffModal
          fixture={editFixture}
          onClose={() => setEditFixture(null)}
          onSave={handleKickoffSave}
        />
      )}
    </div>
  );
}
