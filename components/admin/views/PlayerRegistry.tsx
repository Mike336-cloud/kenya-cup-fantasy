'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Upload, AlertTriangle, Search } from 'lucide-react';
import { MOCK_PLAYERS, CLUB_META } from '@/lib/mockData';
import { formatCost } from '@/lib/fantasyRules';
import { Player, Club, Position, Tier } from '@/types/fantasy';
import { toAvif } from '@/lib/cloudinary';

// Cloudinary upload widget — loaded via next-cloudinary's script
// Falls back to a file-input preview when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set
function CloudinaryUploadWidget({ onUpload }: { onUpload: (url: string) => void }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleClick = () => {
    if (!cloudName) {
      alert('Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local to enable uploads.');
      return;
    }
    // Dynamically open the Cloudinary upload widget
    const widget = window.cloudinary?.createUploadWidget(
      {
        cloudName,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'kc_players',
        folder: 'kenya-cup/headshots',  // ← Player headshots folder
        cropping: true,
        croppingAspectRatio: 1,
        maxFiles: 1,
        resourceType: 'image',
        sources: ['local', 'url', 'camera'],
      },
      (error, result) => {
        if (!error && result?.event === 'success') {
          // Transform URL to deliver as AVIF
          onUpload(toAvif(result.info.secure_url) ?? result.info.secure_url);
        }
      }
    );
    widget?.open();
  };

  return (
    <button type="button" onClick={handleClick} className="btn btn-outline"
      style={{ fontSize: '12px', padding: '8px 14px', width: '100%' }}>
      <Upload size={13} /> Upload Headshot via Cloudinary
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player form modal
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', club: 'Kabras Sugar' as Club,
  position: 'Prop' as Position, tier: 'Tier 1' as Tier,
  cost: 10_000_000, form: 5, totalPoints: 0,
  isJumper: false, isHooker: false, isFrontRow: true,
  isInjured: false, isSuspended: false, isActive: true,
  matchKickoffTime: new Date().toISOString(),
  headshot_url: null as string | null,
  positionGroup: 'Forward' as const,
};

const CLUBS: Club[] = ['Kabras Sugar','KCB Rugby','Menengai Oilers','Kenya Harlequin','Strathmore Leos','KU Blak Blad','Nondescripts','Nakuru','Daystar Falcons','Impala','Mwamba','JKUAT Cougars'];
const POSITIONS: Position[] = ['Prop','Hooker','Lock','Flanker','Number 8','Scrum-half','Fly-half','Center','Wing','Full-back'];
const TIERS: Tier[] = ['Tier 1','Tier 2','Tier 3','Tier 4'];
const TIER_COSTS: Record<Tier, number> = { 'Tier 1': 10_000_000, 'Tier 2': 7_500_000, 'Tier 3': 5_500_000, 'Tier 4': 3_500_000 };
const FORWARD_POSITIONS: Position[] = ['Prop','Hooker','Lock','Flanker','Number 8'];

function PlayerModal({ player, onClose, onSave }: {
  player: typeof EMPTY_FORM | null;
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState(player ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Auto-derive flags when position changes
      if (key === 'position') {
        const pos = value as Position;
        next.isFrontRow = pos === 'Prop' || pos === 'Hooker';
        next.isHooker   = pos === 'Hooker';
        next.isJumper   = pos === 'Lock';
        next.positionGroup = (FORWARD_POSITIONS.includes(pos) ? 'Forward' : 'Back') as 'Forward';
      }
      // Auto-set cost when tier changes
      if (key === 'tier') next.cost = TIER_COSTS[value as Tier];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
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
              <select className="input" value={form.club} onChange={e => update('club', e.target.value as Club)}>
                {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Position */}
            <div>
              <label style={labelStyle}>Position *</label>
              <select className="input" value={form.position} onChange={e => update('position', e.target.value as Position)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
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
              <label style={labelStyle}>Match Kickoff Time *</label>
              <input className="input" type="datetime-local"
                value={form.matchKickoffTime.slice(0, 16)}
                onChange={e => update('matchKickoffTime', new Date(e.target.value).toISOString())} />
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

            {/* Cloudinary upload */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Player Headshot (Cloudinary)</label>
              {form.headshot_url && (
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.headshot_url} alt="Headshot preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Headshot uploaded</span>
                  <button type="button" onClick={() => update('headshot_url', null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '12px' }}>
                    Remove
                  </button>
                </div>
              )}
              <CloudinaryUploadWidget onUpload={url => update('headshot_url', url)} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Requires <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> in .env.local
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? 'Saving…' : <><Check size={14} /> {player ? 'Update Player' : 'Create Player'}</>}
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
  const [players, setPlayers] = useState<Player[]>(
    MOCK_PLAYERS.map(p => ({ ...p, isInjured: false, isSuspended: false, isActive: true }))
  );
  const [search, setSearch] = useState('');
  const [modalPlayer, setModalPlayer] = useState<typeof EMPTY_FORM | null | undefined>(undefined);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
      if (modalPlayer) {
        // UPDATE — in production: await supabase.from('players').update({...}).eq('id', existingId)
        setPlayers(prev => prev.map(p =>
          p.name === modalPlayer.name ? { ...p, ...form } : p
        ));
        showToast(`✓ ${form.name} updated successfully`);
      } else {
        // CREATE — in production: await supabase.from('players').insert({...})
        const newPlayer: Player = {
          ...form, id: `p_${Date.now()}`,
          stats: undefined,
        };
        setPlayers(prev => [newPlayer, ...prev]);
        showToast(`✓ ${form.name} created successfully`);
      }
      setModalPlayer(undefined);
    } catch {
      showToast('Failed to save player', 'error');
    }
  };

  const handleSoftDelete = (player: Player) => {
    // Soft-delete: set isActive = false
    // In production: await supabase.from('players').update({ isActive: false }).eq('id', player.id)
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isActive: false } : p));
    showToast(`${player.name} deactivated (soft-deleted)`);
    setConfirmDelete(null);
  };

  const handleToggleFlag = (playerId: string, flag: 'isInjured' | 'isSuspended') => {
    // In production: await supabase.from('players').update({ [flag]: !current }).eq('id', playerId)
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, [flag]: !p[flag as keyof Player] } : p));
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
                <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong> will be marked inactive. Their historical stats are preserved. This can be reversed.
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                {['Headshot', 'Name', 'Club', 'Position', 'Tier', 'Cost', 'Status', 'Actions'].map(h => (
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
                const clubMeta = CLUB_META[player.club];
                const isActive = (player as Player & { isActive?: boolean }).isActive !== false;
                const isInjured = (player as Player & { isInjured?: boolean }).isInjured === true;
                const isSuspended = (player as Player & { isSuspended?: boolean }).isSuspended === true;

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
                      {player.headshot_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={player.headshot_url} alt={player.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${clubMeta.color}` }} />
                      ) : (
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto',
                          background: clubMeta.bg, border: `2px solid ${clubMeta.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 800, color: clubMeta.color,
                        }}>
                          {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{player.name}</div>
                    </td>

                    {/* Club */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '2px 6px', borderRadius: '4px' }}>
                        {clubMeta.abbr}
                      </span>
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

                    {/* Status toggles */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => handleToggleFlag(player.id, 'isInjured')}
                          title="Toggle injured" style={{
                            padding: '3px 7px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '11px',
                            background: isInjured ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                            color: isInjured ? '#F87171' : 'var(--text-muted)',
                          }}>
                          🤕
                        </button>
                        <button onClick={() => handleToggleFlag(player.id, 'isSuspended')}
                          title="Toggle suspended" style={{
                            padding: '3px 7px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '11px',
                            background: isSuspended ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                            color: isSuspended ? '#FCD34D' : 'var(--text-muted)',
                          }}>
                          🟨
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => setModalPlayer({ ...EMPTY_FORM, ...player, headshot_url: player.headshot_url ?? null, positionGroup: player.positionGroup as typeof EMPTY_FORM['positionGroup'] })}
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

      {/* Supabase note */}
      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Production:</strong> Replace local state mutations with <code>supabase.from(&apos;players&apos;).insert/update/select</code> calls from <code>lib/supabase.ts</code>
      </div>
    </div>
  );
}
