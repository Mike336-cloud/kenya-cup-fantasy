'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Upload, AlertTriangle, Search, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { formatCost } from '@/lib/fantasyRules';
import { Player, Club, Position, Tier, MatchStatus, Fixture } from '@/types/fantasy';
import { usePlayersStore } from '@/lib/playerStore';
import { useClubsStore } from '@/lib/clubStore';
import { useFixtureStore, MutableFixture } from '@/lib/fixtureStore';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { ClubLogo } from '@/components/common/ClubLogo';
import { toOptimizedUrl } from '@/lib/cloudinary';

function openCloudinaryHeadshotWidget(onSuccess: (url: string) => void) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    alert('Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
    return;
  }
  if (typeof window === 'undefined' || !window.cloudinary) {
    alert('Cloudinary widget script is still loading. Please wait 2 seconds and try again.');
    return;
  }
  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'kc_players',
      folder: 'kenya-cup/headshots',
      cropping: true,
      croppingAspectRatio: 1,
      maxFiles: 1,
      resourceType: 'image',
      sources: ['local', 'url', 'camera'],
    },
    (err: unknown, result: { event?: string; info?: { secure_url?: string } }) => {
      if (!err && result?.event === 'success' && result.info?.secure_url) {
        onSuccess(toOptimizedUrl(result.info.secure_url) ?? result.info.secure_url);
      }
    }
  );
  widget?.open();
}

function CloudinaryUploadWidget({ onUpload }: { onUpload: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => openCloudinaryHeadshotWidget(onUpload)}
      className="btn btn-outline"
      style={{ fontSize: '12px', padding: '8px 14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
    >
      <Upload size={13} /> Upload Headshot via Cloudinary
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player form modal
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_ROUND_1_KICKOFF = '2026-11-21T15:00:00+03:00';

function findNextFixtureForClub(
  clubName: string,
  fixtures: (Fixture | MutableFixture)[],
  activeRound: number = 1
): (Fixture | MutableFixture) | null {
  if (!clubName || !fixtures || fixtures.length === 0) return null;
  const target = clubName.toLowerCase().replace(/rfc|fc|rugby/gi, '').trim();

  const matchesClub = (c?: string) => {
    if (!c) return false;
    const norm = c.toLowerCase().replace(/rfc|fc|rugby/gi, '').trim();
    return norm.includes(target) || target.includes(norm);
  };

  // 1. Look for fixture in active round
  const roundFixtures = fixtures.filter(f => Number(f.gameweek) === activeRound);
  const matchInRound = roundFixtures.find(f => matchesClub(f.homeClub) || matchesClub(f.awayClub));
  if (matchInRound) return matchInRound;

  // 2. Earliest scheduled fixture
  const upcoming = [...fixtures]
    .filter(f => (f.status || '').toLowerCase() !== 'completed')
    .sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

  return upcoming.find(f => matchesClub(f.homeClub) || matchesClub(f.awayClub)) || null;
}

const EMPTY_FORM = {
  name: '', club: 'Kabras Sugar' as Club,
  position: 'Loosehead Prop' as Position, tier: 'Tier 1' as Tier,
  cost: 10_000_000, form: 5, totalPoints: 0,
  isJumper: false, isHooker: false, isFrontRow: true,
  isInjured: false, isSuspended: false, isActive: true,
  matchStatus: 'starting' as MatchStatus,
  matchKickoffTime: DEFAULT_ROUND_1_KICKOFF,
  headshot_url: null as string | null,
  positionGroup: 'Forward' as const,
};

const CLUBS: Club[] = [
  'Kabras Sugar', 'KCB Rugby', 'Menengai Oilers', 'Kenya Harlequin',
  'Strathmore Leos', 'KU Blak Blad', 'Nondescripts', 'Nakuru',
  'Daystar Falcons', 'Impala', 'Mwamba', 'JKUAT Cougars',
];
const TIERS: Tier[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
const TIER_COSTS: Record<Tier, number> = { 'Tier 1': 10_000_000, 'Tier 2': 7_500_000, 'Tier 3': 5_500_000, 'Tier 4': 3_500_000 };
const FORWARD_POSITIONS: Position[] = [
  'Loosehead Prop',
  'Hooker',
  'Tighthead Prop',
  'Lock',
  'Blindside Flanker',
  'Openside Flanker',
  'Number 8',
  'Front Row',
  'Back Row',
  'Prop',
  'Flanker',
];

function PlayerModal({ player, onClose, onSave }: {
  player: typeof EMPTY_FORM | null;
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
}) {
  const { fixtures, activeRound, fetchFixtures } = useFixtureStore();

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const [form, setForm] = useState(() => {
    if (player) return player;
    return {
      ...EMPTY_FORM,
      matchKickoffTime: DEFAULT_ROUND_1_KICKOFF,
    };
  });
  const [saving, setSaving] = useState(false);

  const matchedFixture = findNextFixtureForClub(form.club, fixtures, activeRound);

  // Auto-sync for a new player once fixtures load
  useEffect(() => {
    if (!player && fixtures.length > 0) {
      const fx = findNextFixtureForClub(form.club, fixtures, activeRound);
      if (fx?.kickoffTime && form.matchKickoffTime === DEFAULT_ROUND_1_KICKOFF) {
        queueMicrotask(() => {
          setForm(prev => (prev.matchKickoffTime === DEFAULT_ROUND_1_KICKOFF ? { ...prev, matchKickoffTime: fx.kickoffTime } : prev));
        });
      }
    }
  }, [player, fixtures, form.club, activeRound, form.matchKickoffTime]);

  const handleClubChange = (newClub: Club) => {
    const fx = findNextFixtureForClub(newClub, fixtures, activeRound);
    const newKickoff = fx?.kickoffTime || DEFAULT_ROUND_1_KICKOFF;
    setForm(prev => ({
      ...prev,
      club: newClub,
      matchKickoffTime: newKickoff,
    }));
  };

  const update = <K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'position') {
        const pos = value as Position;
        next.isFrontRow = pos === 'Loosehead Prop' || pos === 'Tighthead Prop' || pos === 'Hooker' || pos === 'Front Row' || (pos as string) === 'Prop';
        next.isHooker   = pos === 'Hooker';
        next.isJumper   = pos === 'Lock' || pos === 'Blindside Flanker' || pos === 'Openside Flanker' || pos === 'Number 8' || pos === 'Back Row' || (pos as string) === 'Flanker';
        next.positionGroup = (FORWARD_POSITIONS.includes(pos) ? 'Forward' : 'Back') as 'Forward';
      }
      if (key === 'tier') next.cost = TIER_COSTS[value as Tier];
      if (key === 'matchStatus') {
        const ms = value as MatchStatus;
        next.isInjured = ms === 'injured';
        next.isSuspended = ms === 'suspended';
      }
      if (key === 'isInjured') {
        if (value) next.matchStatus = 'injured';
        else if (next.matchStatus === 'injured') next.matchStatus = 'starting';
      }
      if (key === 'isSuspended') {
        if (value) next.matchStatus = 'suspended';
        else if (next.matchStatus === 'suspended') next.matchStatus = 'starting';
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: '16px', width: '100%', maxWidth: '580px',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            {player ? 'Edit Player' : 'Create Player'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Full Name *</label>
              <input className="input" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Vincent Onyala" />
            </div>

            {/* Club */}
            <div>
              <label style={labelStyle}>Club *</label>
              <select className="input" value={form.club} onChange={e => handleClubChange(e.target.value as Club)}>
                {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Position */}
            <div>
              <label style={labelStyle}>Position *</label>
              <select className="input" value={form.position} onChange={e => update('position', e.target.value as Position)}>
                <optgroup label="The Tight Five">
                  <option value="Loosehead Prop">Loosehead Prop</option>
                  <option value="Hooker">Hooker</option>
                  <option value="Tighthead Prop">Tighthead Prop</option>
                  <option value="Lock">Lock</option>
                </optgroup>
                <optgroup label="The Back Row">
                  <option value="Blindside Flanker">Blindside Flanker</option>
                  <option value="Openside Flanker">Openside Flanker</option>
                  <option value="Number 8">Number 8</option>
                </optgroup>
                <optgroup label="The Halfbacks">
                  <option value="Scrum-half">Scrum-half</option>
                  <option value="Fly-half">Fly-half</option>
                </optgroup>
                <optgroup label="The Midfield & Outside Backs">
                  <option value="Inside Center">Inside Center</option>
                  <option value="Outside Center">Outside Center</option>
                  <option value="Left Wing">Left Wing</option>
                  <option value="Right Wing">Right Wing</option>
                  <option value="Fullback">Fullback</option>
                </optgroup>
                <optgroup label="Utility & Broad Roster Designations">
                  <option value="Utility Back">Utility Back</option>
                  <option value="Front Row">Front Row</option>
                  <option value="Back Row">Back Row</option>
                </optgroup>
              </select>
            </div>

            {/* Tier */}
            <div>
              <label style={labelStyle}>Tier *</label>
              <select className="input" value={form.tier} onChange={e => update('tier', e.target.value as Tier)}>
                {TIERS.map(t => <option key={t} value={t}>{t} — {formatCost(TIER_COSTS[t])}</option>)}
              </select>
            </div>

            {/* Kickoff time */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Match Kickoff Time</label>
                <button
                  type="button"
                  onClick={() => {
                    const fx = findNextFixtureForClub(form.club, fixtures, activeRound);
                    update('matchKickoffTime', fx?.kickoffTime || DEFAULT_ROUND_1_KICKOFF);
                  }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#10B981', fontSize: '11px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '3px', padding: 0,
                  }}
                  title="Sync with Club's scheduled fixture"
                >
                  <RefreshCw size={11} /> Auto-Sync
                </button>
              </div>
              <input
                className="input"
                type="datetime-local"
                value={form.matchKickoffTime ? form.matchKickoffTime.slice(0, 16) : ''}
                onChange={e => update('matchKickoffTime', e.target.value ? new Date(e.target.value).toISOString() : DEFAULT_ROUND_1_KICKOFF)}
                style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  borderColor: 'rgba(16, 185, 129, 0.35)',
                }}
              />
              {matchedFixture ? (
                <div style={{ fontSize: '11px', color: '#34D399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>⚡ Auto-synced from Round {matchedFixture.gameweek}: <strong>{matchedFixture.homeClub} vs {matchedFixture.awayClub}</strong></span>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Round 1 kickoff: Nov 21, 2026 15:00 EAT
                </div>
              )}
            </div>

            {/* Match Status for Current Round */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Round Match Status *</label>
              <select className="input" value={form.matchStatus} onChange={e => update('matchStatus', e.target.value as MatchStatus)}>
                <option value="starting">🟢 Starting XV</option>
                <option value="bench">🔄 Bench / Substitute</option>
                <option value="injured">🤕 Injured</option>
                <option value="suspended">🟨 Suspended</option>
              </select>
            </div>

            {/* Status flags */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {([['isInjured', '🤕 Injured'], ['isSuspended', '🟨 Suspended'], ['isActive', '✅ Active']] as const).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form[key] as boolean} onChange={e => update(key, e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} />
                  {label}
                </label>
              ))}
            </div>

            {/* Headshot section */}
            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>Player Headshot (Cloudinary / kenya-cup/headshots)</label>
              {form.headshot_url ? (
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.headshot_url} alt="Headshot preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>✓ Headshot attached</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {form.headshot_url}
                    </div>
                  </div>
                  <button type="button" onClick={() => update('headshot_url', null)} className="btn btn-outline" style={{ color: 'var(--danger)', fontSize: '11px', padding: '5px 10px' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No headshot attached yet. Upload via Cloudinary or paste a direct image URL.
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <CloudinaryUploadWidget onUpload={url => update('headshot_url', url)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LinkIcon size={12} /> Direct URL:
                  </span>
                  <input
                    className="input"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    value={form.headshot_url ?? ''}
                    onChange={e => update('headshot_url', e.target.value.trim() || null)}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? <><RefreshCw size={14} className="spin" /> Saving…</> : <><Check size={14} /> {player ? 'Update Player & Save' : 'Create Player & Save'}</>}
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
// Player Registry (View A)
// ─────────────────────────────────────────────────────────────────────────────
export function PlayerRegistry() {
  const { players, updatePlayer, addPlayer, softDeletePlayer, fetchPlayers, isLoading } = usePlayersStore();
  const { getClubMeta } = useClubsStore();
  const [search, setSearch] = useState('');
  const [modalPlayer, setModalPlayer] = useState<(typeof EMPTY_FORM & { id?: string }) | null | undefined>(undefined);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.club.toLowerCase().includes(search.toLowerCase()) ||
    p.position.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form: typeof EMPTY_FORM) => {
    try {
      if (modalPlayer && modalPlayer.id) {
        await updatePlayer(modalPlayer.id, form);
        showToast(`✓ ${form.name} updated successfully`);
        setModalPlayer(undefined);
      } else {
        await addPlayer(form);
        showToast(`✓ ${form.name} created successfully`);
        setModalPlayer(undefined);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save player';
      showToast(`Error: ${msg}`, 'error');
    }
  };

  const handleSoftDelete = async (player: Player) => {
    try {
      await softDeletePlayer(player.id);
      showToast(`${player.name} deactivated`);
      setConfirmDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate player';
      showToast(`Error: ${msg}`, 'error');
    }
  };

  const handleCycleStatus = async (playerId: string) => {
    const statuses: MatchStatus[] = ['starting', 'bench', 'injured', 'suspended'];
    const p = players.find(item => item.id === playerId);
    if (!p) return;
    const current = p.matchStatus || (p.isInjured ? 'injured' : p.isSuspended ? 'suspended' : 'starting');
    const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    try {
      await updatePlayer(playerId, {
        matchStatus: nextStatus,
        isInjured: nextStatus === 'injured',
        isSuspended: nextStatus === 'suspended',
      });
      showToast(`${p.name} status: ${nextStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      showToast(`Error: ${msg}`, 'error');
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 300,
          padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#34D399' : '#FCA5A5',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (() => {
        const p = players.find(pl => pl.id === confirmDelete)!;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '28px', maxWidth: '400px', width: '90%' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <AlertTriangle size={20} color="var(--warning)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Soft-Delete Player</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong> will be marked inactive. Their historical stats are preserved.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDelete(null)} className="btn btn-outline">Cancel</button>
                <button onClick={() => handleSoftDelete(p)} className="btn btn-danger">Deactivate</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search players…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => fetchPlayers(true)}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title="Sync players with database"
            disabled={isLoading}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} /> {isLoading ? 'Syncing…' : 'Sync DB'}
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} players</span>
          <button onClick={() => setModalPlayer(null)} className="btn btn-gold" style={{ fontSize: '13px' }}>
            <Plus size={14} /> Add Player
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['Headshot', 'Name', 'Club', 'Position', 'Tier', 'Cost', 'Match Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', fontSize: '10px', fontWeight: 700,
                    color: 'var(--text-muted)', textAlign: h === 'Name' ? 'left' : 'center',
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((player, i) => {
                const clubMeta = getClubMeta(player.club);
                const isActive = (player as Player & { isActive?: boolean }).isActive !== false;
                const matchStatus = player.matchStatus || (player.isInjured ? 'injured' : player.isSuspended ? 'suspended' : 'starting');

                return (
                  <tr key={player.id} style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: isActive ? 1 : 0.4,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Headshot */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <PlayerAvatar
                        name={player.name}
                        headshotUrl={player.headshot_url}
                        clubName={player.club}
                        size={38}
                        style={{ margin: '0 auto' }}
                      />
                    </td>

                    {/* Name */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{player.name}</div>
                      {player.headshot_url && (
                        <div style={{ fontSize: '10px', color: '#34D399', marginTop: '2px' }}>✓ Headshot active</div>
                      )}
                    </td>

                    {/* Club with logo */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <ClubLogo
                          clubName={player.club}
                          logoUrl={player.clubs?.logo_url || player.club_logo_url}
                          size={22}
                          showBorder={false}
                        />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '2px 6px', borderRadius: '4px' }}>
                          {clubMeta.abbr}
                        </span>
                      </div>
                    </td>

                    {/* Position */}
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {player.position}
                    </td>

                    {/* Tier */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span className={`badge ${player.tier === 'Tier 1' ? 'badge-gold' : player.tier === 'Tier 2' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '9px' }}>
                        {player.tier}
                      </span>
                    </td>

                    {/* Cost */}
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>
                      {formatCost(player.cost)}
                    </td>

                    {/* Match Status */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(player.id)}
                        title="Click to cycle status (Starting → Bench → Injured → Suspended)"
                        style={{
                          padding: '4px 9px', borderRadius: '6px', border: '1px solid', cursor: 'pointer',
                          fontSize: '11px', fontWeight: 700,
                          background: matchStatus === 'starting'
                            ? 'rgba(16,185,129,0.15)'
                            : matchStatus === 'bench'
                            ? 'rgba(59,130,246,0.15)'
                            : matchStatus === 'injured'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(245,158,11,0.15)',
                          borderColor: matchStatus === 'starting'
                            ? 'rgba(16,185,129,0.4)'
                            : matchStatus === 'bench'
                            ? 'rgba(59,130,246,0.4)'
                            : matchStatus === 'injured'
                            ? 'rgba(239,68,68,0.4)'
                            : 'rgba(245,158,11,0.4)',
                          color: matchStatus === 'starting'
                            ? '#34D399'
                            : matchStatus === 'bench'
                            ? '#60A5FA'
                            : matchStatus === 'injured'
                            ? '#F87171'
                            : '#FCD34D',
                          transition: 'all 0.15s',
                        }}
                      >
                        {matchStatus === 'starting' ? '🟢 Starting' : matchStatus === 'bench' ? '🔄 Bench' : matchStatus === 'injured' ? '🤕 Injured' : '🟨 Suspended'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => setModalPlayer({
                          ...EMPTY_FORM,
                          ...player,
                          matchStatus: (player.matchStatus || (player.isInjured ? 'injured' : player.isSuspended ? 'suspended' : 'starting')) as MatchStatus,
                          headshot_url: player.headshot_url ?? null,
                          positionGroup: player.positionGroup as typeof EMPTY_FORM['positionGroup'],
                        })}
                          title="Edit" style={{ padding: '6px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#93C5FD' }}>
                          <Pencil size={12} />
                        </button>
                        {isActive && (
                          <button onClick={() => setConfirmDelete(player.id)}
                            title="Soft-delete" style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#FCA5A5' }}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalPlayer !== undefined && (
        <PlayerModal
          player={modalPlayer}
          onClose={() => setModalPlayer(undefined)}
          onSave={handleSave}
        />
      )}

      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Headshots & Status:</strong> Player headshots and statuses are stored in Cloudinary and synchronized with Supabase. Updates immediately reflect in the fantasy squad builder and player cards.
      </div>
    </div>
  );
}
