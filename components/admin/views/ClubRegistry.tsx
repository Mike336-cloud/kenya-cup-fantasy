'use client';
import { useState } from 'react';
import { Plus, Pencil, X, Check, Upload, Power } from 'lucide-react';
import { ClubRecord } from '@/types/fantasy';
import { CLUB_META } from '@/lib/mockData';
import { toAvif } from '@/lib/cloudinary';

// Seed mock clubs from existing CLUB_META
const seedClubs = (): ClubRecord[] =>
  Object.entries(CLUB_META).map(([name, meta], i) => ({
    id: `club_${i + 1}`,
    name,
    abbreviation: meta.abbr,
    logo_url: null,
    primary_color: meta.color,
    secondary_color: '#000000',
    home_ground: null,
    is_active_in_kenya_cup: true,
    founded_year: null,
  }));

function CloudinaryLogoWidget({ onUpload }: { onUpload: (url: string) => void }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const handleClick = () => {
    if (!cloudName) { alert('Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local'); return; }
    const widget = window.cloudinary?.createUploadWidget(
      {
        cloudName,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'kc_players',
        folder: 'kenya-cup/logos',       // ← Club logos folder
        cropping: true, croppingAspectRatio: 1,
        maxFiles: 1, resourceType: 'image',
        sources: ['local', 'url'],
      },
      (_err, result) => {
        if (!_err && result?.event === 'success') onUpload(toAvif(result.info.secure_url) ?? result.info.secure_url);
      }
    );
    widget?.open();
  };
  return (
    <button type="button" onClick={handleClick} className="btn btn-outline" style={{ fontSize: '12px', padding: '7px 12px', width: '100%' }}>
      <Upload size={12} /> Upload Logo (Cloudinary)
    </button>
  );
}

const EMPTY_CLUB: Omit<ClubRecord, 'id' | 'created_at' | 'updated_at'> = {
  name: '', abbreviation: '', logo_url: null,
  primary_color: '#16a34a', secondary_color: '#ffffff',
  home_ground: '', is_active_in_kenya_cup: true, founded_year: null,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '6px',
};

function ClubModal({ club, onClose, onSave }: {
  club: typeof EMPTY_CLUB | null;
  onClose: () => void;
  onSave: (data: typeof EMPTY_CLUB) => void;
}) {
  const [form, setForm] = useState<typeof EMPTY_CLUB>(club ?? { ...EMPTY_CLUB });
  const update = <K extends keyof typeof EMPTY_CLUB>(k: K, v: typeof EMPTY_CLUB[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'auto', maxHeight: '90vh' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{club ? 'Edit Club' : 'Add Club'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Club Name *</label>
              <input className="input" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Kabras Sugar" />
            </div>
            <div>
              <label style={labelStyle}>Abbreviation * (3–4 chars)</label>
              <input className="input" required maxLength={4} value={form.abbreviation} onChange={e => update('abbreviation', e.target.value.toUpperCase())} placeholder="KBS" />
            </div>
            <div>
              <label style={labelStyle}>Home Ground</label>
              <input className="input" value={form.home_ground ?? ''} onChange={e => update('home_ground', e.target.value)} placeholder="e.g. Kakamega RFC" />
            </div>
            <div>
              <label style={labelStyle}>Primary Colour</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={form.primary_color} onChange={e => update('primary_color', e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }} />
                <input className="input" value={form.primary_color} onChange={e => update('primary_color', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Secondary Colour</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={form.secondary_color} onChange={e => update('secondary_color', e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }} />
                <input className="input" value={form.secondary_color} onChange={e => update('secondary_color', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Founded Year</label>
              <input className="input" type="number" value={form.founded_year ?? ''} onChange={e => update('founded_year', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 1995" />
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <label style={labelStyle}>Club Logo (Cloudinary / kenya-cup/logos)</label>
            {form.logo_url && (
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logo_url} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.1)', padding: '4px' }} />
                <span style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Logo uploaded</span>
                <button type="button" onClick={() => update('logo_url', null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '12px' }}>Remove</button>
              </div>
            )}
            <CloudinaryLogoWidget onUpload={url => update('logo_url', url)} />
          </div>

          {/* Active toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.is_active_in_kenya_cup} onChange={e => update('is_active_in_kenya_cup', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} />
            Active in Kenya Cup Season 26/27
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="button" onClick={() => { onSave(form); onClose(); }} className="btn btn-gold">
              <Check size={13} /> {club ? 'Update Club' : 'Add Club'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function ClubRegistry() {
  const [clubs, setClubs] = useState<ClubRecord[]>(seedClubs());
  const [modalClub, setModalClub] = useState<typeof EMPTY_CLUB | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = (form: typeof EMPTY_CLUB) => {
    if (modalClub) {
      // UPDATE — production: supabase.from('clubs').update({...}).eq('id', existingId)
      setClubs(prev => prev.map(c => c.name === modalClub.name ? { ...c, ...form } : c));
      showToast(`✓ ${form.name} updated`);
    } else {
      // INSERT — production: supabase.from('clubs').insert({...})
      setClubs(prev => [{ ...form, id: `club_${Date.now()}` }, ...prev]);
      showToast(`✓ ${form.name} added`);
    }
  };

  const handleToggleActive = (id: string) => {
    // production: supabase.from('clubs').update({ is_active_in_kenya_cup: !current }).eq('id', id)
    setClubs(prev => prev.map(c => c.id === id ? { ...c, is_active_in_kenya_cup: !c.is_active_in_kenya_cup } : c));
  };

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 300, padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{clubs.length} clubs · {clubs.filter(c => c.is_active_in_kenya_cup).length} active this season</p>
        <button onClick={() => setModalClub(null)} className="btn btn-gold" style={{ fontSize: '13px' }}>
          <Plus size={14} /> Add Club
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {clubs.map(club => (
          <div key={club.id} className="card" style={{
            padding: '16px', opacity: club.is_active_in_kenya_cup ? 1 : 0.5,
            border: `1px solid ${club.is_active_in_kenya_cup ? 'var(--border)' : 'rgba(239,68,68,0.3)'}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {/* Logo or color swatch */}
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${club.primary_color}22`, border: `2px solid ${club.primary_color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {club.logo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={club.logo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontWeight: 900, fontSize: '11px', color: club.primary_color }}>{club.abbreviation}</span>
                }
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{club.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{club.home_ground ?? 'Ground TBC'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>
                <span className={`badge ${club.is_active_in_kenya_cup ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '9px' }}>
                  {club.is_active_in_kenya_cup ? '✓ ACTIVE' : 'INACTIVE'}
                </span>
              </span>
              <button onClick={() => setModalClub({ ...EMPTY_CLUB, ...club })} title="Edit"
                style={{ padding: '5px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '5px', cursor: 'pointer', color: '#93C5FD' }}>
                <Pencil size={11} />
              </button>
              <button onClick={() => handleToggleActive(club.id)} title={club.is_active_in_kenya_cup ? 'Deactivate' : 'Reactivate'}
                style={{ padding: '5px', background: club.is_active_in_kenya_cup ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${club.is_active_in_kenya_cup ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '5px', cursor: 'pointer', color: club.is_active_in_kenya_cup ? '#FCA5A5' : '#34D399' }}>
                <Power size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Production:</strong> Club logos are uploaded to <code>kenya-cup/logos</code> in Cloudinary. Toggle Active deactivates the club&apos;s players in fantasy selection. Add a new club when promotions happen.
      </div>

      {modalClub !== undefined && (
        <ClubModal club={modalClub} onClose={() => setModalClub(undefined)} onSave={handleSave} />
      )}
    </div>
  );
}
