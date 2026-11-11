'use client';
import { useState, useEffect } from 'react';
import { Clock, Pencil, PauseCircle, PlayCircle, Check, AlertTriangle, Plus, Trash2, X, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { useFixtureStore, MutableFixture } from '@/lib/fixtureStore';
import { useClubsStore } from '@/lib/clubStore';
import { ClubLogo } from '@/components/common/ClubLogo';
import { Fixture, Club } from '@/types/fantasy';

function formatLocal(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-KE', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Create New Fixture
// ─────────────────────────────────────────────────────────────────────────────
function CreateFixtureModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Omit<Fixture, 'id'>) => Promise<void>;
}) {
  const { clubs } = useClubsStore();
  const activeRound = useFixtureStore(s => s.activeRound);
  const activeClubs = clubs.filter(c => c.is_active_in_kenya_cup);
  const clubList = activeClubs.length > 0 ? activeClubs : clubs;

  const [gameweek, setGameweek] = useState(activeRound || 1);
  const [homeClub, setHomeClub] = useState(clubList[0]?.name || 'Kabras Sugar');
  const [awayClub, setAwayClub] = useState(clubList[1]?.name || 'KCB Rugby');

  // Default to upcoming Saturday at 15:00
  const getDefaultKickoff = () => {
    const d = new Date();
    const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSaturday);
    d.setHours(15, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [kickoff, setKickoff] = useState(getDefaultKickoff);
  const [venue, setVenue] = useState(clubList[0]?.home_ground || 'Kakamega RFC');
  const [status, setStatus] = useState<'scheduled' | 'live' | 'completed'>('scheduled');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill venue when home club changes if using default
  const handleHomeClubChange = (name: string) => {
    setHomeClub(name);
    const selected = clubs.find(c => c.name === name);
    if (selected?.home_ground) {
      setVenue(selected.home_ground);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (homeClub === awayClub) {
      setError('Home and Away clubs cannot be the same club.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        gameweek,
        homeClub: homeClub as Club,
        awayClub: awayClub as Club,
        kickoffTime: new Date(kickoff).toISOString(),
        venue,
        status,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to create fixture.');
    } finally {
      setSaving(false);
    }
  };

  const homeMeta = useClubsStore.getState().getClubMeta(homeClub);
  const awayMeta = useClubsStore.getState().getClubMeta(awayClub);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: '16px', width: '100%', maxWidth: '540px',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--gold)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Create New Fixture</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#F87171', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Live Preview Card */}
          <div style={{
            padding: '16px', marginBottom: '20px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Matchup Preview · Round {gameweek}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {/* Home */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <ClubLogo clubName={homeClub} size={32} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{homeClub}</div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: homeMeta.color }}>{homeMeta.abbr} (Home)</span>
                </div>
              </div>

              {/* VS */}
              <div style={{ padding: '4px 8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--gold)' }}>
                VS
              </div>

              {/* Away */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, justifyContent: 'flex-end', textAlign: 'right' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{awayClub}</div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: awayMeta.color }}>{awayMeta.abbr} (Away)</span>
                </div>
                <ClubLogo clubName={awayClub} size={32} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--gold)" /> {venue || 'Ground TBC'}
              </span>
              <span>
                {kickoff ? new Date(kickoff).toLocaleString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Gameweek */}
            <div>
              <label style={labelStyle}>Kenya Cup Round *</label>
              <select className="input" value={gameweek} onChange={e => setGameweek(Number(e.target.value))}>
                {Array.from({ length: 18 }, (_, i) => i + 1).map(r => (
                  <option key={r} value={r}>Round {r}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Match Status *</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value as typeof status)}>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live Now</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Home Club */}
            <div>
              <label style={labelStyle}>Home Club *</label>
              <select className="input" value={homeClub} onChange={e => handleHomeClubChange(e.target.value)}>
                {clubList.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.abbreviation})</option>
                ))}
              </select>
            </div>

            {/* Away Club */}
            <div>
              <label style={labelStyle}>Away Club *</label>
              <select className="input" value={awayClub} onChange={e => setAwayClub(e.target.value)}>
                {clubList.map(c => (
                  <option key={c.name} value={c.name} disabled={c.name === homeClub}>
                    {c.name} ({c.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            {/* Kickoff Date & Time */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Kickoff Date & Time * (East Africa Time)</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={kickoff}
                onChange={e => setKickoff(e.target.value)}
              />
            </div>

            {/* Venue */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Venue / Stadium *</label>
              <input
                className="input"
                required
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="e.g. Kakamega RFC or RFUEA Ground"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? <><RefreshCw size={14} className="spin" /> Creating…</> : <><Check size={14} /> Create Fixture & Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Edit Existing Fixture
// ─────────────────────────────────────────────────────────────────────────────
function EditFixtureModal({
  fixture,
  onClose,
  onSave,
}: {
  fixture: MutableFixture;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MutableFixture>) => Promise<void>;
}) {
  const [kickoff, setKickoff] = useState(fixture.kickoffTime.slice(0, 16));
  const [venue, setVenue] = useState(fixture.venue);
  const [status, setStatus] = useState(fixture.status || 'scheduled');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(fixture.id, {
      kickoffTime: new Date(kickoff).toISOString(),
      venue,
      status: status as Fixture['status'],
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card" style={{ padding: '24px', maxWidth: '460px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Edit Fixture</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClubLogo clubName={fixture.homeClub} size={20} showBorder={false} />
          <strong>{fixture.homeClub}</strong> vs <strong>{fixture.awayClub}</strong>
          <ClubLogo clubName={fixture.awayClub} size={20} showBorder={false} />
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Kickoff Date & Time</label>
            <input className="input" type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} required />
          </div>

          <div>
            <label style={labelStyle}>Venue</label>
            <input className="input" value={venue} onChange={e => setVenue(e.target.value)} required />
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value as typeof status)}>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? 'Saving…' : <><Check size={14} /> Update Fixture</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '6px',
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture Controller (View B)
// ─────────────────────────────────────────────────────────────────────────────
export function FixtureController() {
  const {
    fixtures,
    activeRound,
    setActiveRound,
    fetchFixtures,
    createFixture,
    updateFixture,
    deleteFixture,
    togglePostpone,
    isLoading,
  } = useFixtureStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editFixture, setEditFixture] = useState<MutableFixture | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedGameweek, setSelectedGameweek] = useState<number | 'all'>(activeRound || 1);
  const [toast, setToast] = useState<string | null>(null);
  const now = new Date();

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async (data: Omit<Fixture, 'id'>) => {
    await createFixture(data);
    showToast(`✓ Fixture created: ${data.homeClub} vs ${data.awayClub}`);
  };

  const handleUpdate = async (id: string, updates: Partial<MutableFixture>) => {
    await updateFixture(id, updates);
    showToast('✓ Fixture updated');
  };

  const handleDelete = async (id: string) => {
    await deleteFixture(id);
    setDeleteId(null);
    showToast('✓ Fixture deleted');
  };

  const handlePostponeToggle = async (id: string) => {
    await togglePostpone(id);
    const f = fixtures.find(item => item.id === id);
    if (f) {
      showToast(f.isPostponed
        ? `▶ ${f.homeClub} vs ${f.awayClub} reinstated`
        : `⏸ ${f.homeClub} vs ${f.awayClub} postponed — lockouts lifted`
      );
    }
  };

  const filteredFixtures = selectedGameweek === 'all'
    ? fixtures
    : fixtures.filter(f => Number(f.gameweek) === Number(selectedGameweek));

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

      {/* Delete Confirmation Dialog */}
      {deleteId && (() => {
        const f = fixtures.find(item => item.id === deleteId);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Delete Fixture</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Are you sure you want to delete <strong>{f?.homeClub} vs {f?.awayClub}</strong>?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteId(null)} className="btn btn-outline">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="btn btn-danger">Delete Fixture</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Active Round for Frontend */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,175,55,0.1)', padding: '6px 12px',
            borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              ⚡ Active Frontend Round:
            </span>
            <select
              className="input"
              value={activeRound}
              onChange={e => {
                const r = Number(e.target.value);
                setActiveRound(r);
                setSelectedGameweek(r);
                showToast(`⚡ Active Round set to Round ${r}`);
              }}
              style={{ width: 'auto', padding: '4px 10px', fontSize: '12px', fontWeight: 700, background: 'var(--bg-card)' }}
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map(r => (
                <option key={r} value={r}>Round {r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Filter Table:</span>
            <select
              className="input"
              value={selectedGameweek}
              onChange={e => setSelectedGameweek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="all">All Rounds</option>
              {Array.from({ length: 18 }, (_, i) => i + 1).map(r => (
                <option key={r} value={r}>Round {r}</option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({filteredFixtures.length} match{filteredFixtures.length === 1 ? '' : 'es'})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => fetchFixtures(true)}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            disabled={isLoading}
            title="Refresh fixtures from database"
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} /> {isLoading ? 'Syncing…' : 'Sync DB'}
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-gold"
            style={{ fontSize: '13px' }}
          >
            <Plus size={14} /> Create Fixture
          </button>
        </div>
      </div>

      {/* Simulated current time banner */}
      <div style={{
        padding: '14px 18px', marginBottom: '18px',
        background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)',
        borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
      }}>
        <Clock size={16} color="var(--neon)" />
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current System Time</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neon)' }}>{now.toLocaleString('en-KE')}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
          Player lockouts engage at kickoff time (≤ now) unless postponed.
        </div>
      </div>

      {/* Fixtures table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['Round', 'Match', 'Kickoff Time', 'Venue', 'Status', 'Lockout', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', fontSize: '10px', fontWeight: 700,
                    color: 'var(--text-muted)', textAlign: h === 'Match' || h === 'Venue' ? 'left' : 'center',
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFixtures.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No fixtures found for this round. Click <strong>&quot;Create Fixture&quot;</strong> to schedule one.
                  </td>
                </tr>
              ) : (
                filteredFixtures.map((f, i) => {
                  const homeMeta = useClubsStore.getState().getClubMeta(f.homeClub);
                  const awayMeta = useClubsStore.getState().getClubMeta(f.awayClub);
                  const isLocked = new Date(f.kickoffTime) <= now && !f.isPostponed;
                  const isPast   = new Date(f.kickoffTime) < now;

                  return (
                    <tr key={f.id} style={{
                      borderBottom: i < filteredFixtures.length - 1 ? '1px solid var(--border)' : 'none',
                      opacity: f.isPostponed ? 0.55 : 1,
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Round */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--gold)' }}>
                        R{f.gameweek || 4}
                      </td>

                      {/* Match with logos */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ClubLogo clubName={f.homeClub} size={22} showBorder={false} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{f.homeClub}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 800 }}>vs</span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ClubLogo clubName={f.awayClub} size={22} showBorder={false} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{f.awayClub}</span>
                          </div>
                        </div>
                      </td>

                      {/* Kickoff */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatLocal(f.kickoffTime)}
                      </td>

                      {/* Venue */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="var(--gold)" /> {f.venue}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span className={`badge ${f.isPostponed ? 'badge-red' : f.status === 'live' ? 'badge-gold' : isPast ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '9px' }}>
                          {f.isPostponed ? 'POSTPONED' : f.status ? f.status.toUpperCase() : isPast ? 'COMPLETED' : 'SCHEDULED'}
                        </span>
                      </td>

                      {/* Lockout status */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {f.isPostponed ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lifted</span>
                        ) : isLocked ? (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#F87171' }}>🔒 LOCKED</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#34D399' }}>🔓 Open</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => setEditFixture(f)}
                            title="Edit Kickoff & Venue"
                            style={{ padding: '6px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#93C5FD' }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handlePostponeToggle(f.id)}
                            title={f.isPostponed ? 'Reinstate match' : 'Postpone match'}
                            style={{
                              padding: '6px',
                              background: f.isPostponed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              border: `1px solid ${f.isPostponed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: f.isPostponed ? '#34D399' : '#FCA5A5',
                            }}
                          >
                            {f.isPostponed ? <PlayCircle size={12} /> : <PauseCircle size={12} />}
                          </button>
                          <button
                            onClick={() => setDeleteId(f.id)}
                            title="Delete Fixture"
                            style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#FCA5A5' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Fixture Engine:</strong> New fixtures created here are saved to Supabase and immediately update round schedules across the application. Postponing a fixture lifts squad selection lockouts for all affected players.
      </div>

      {createModalOpen && (
        <CreateFixtureModal onClose={() => setCreateModalOpen(false)} onSave={handleCreate} />
      )}

      {editFixture && (
        <EditFixtureModal fixture={editFixture} onClose={() => setEditFixture(null)} onSave={handleUpdate} />
      )}
    </div>
  );
}
