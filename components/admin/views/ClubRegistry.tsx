'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, X, Check, Upload, Power, Image as ImageIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { ClubRecord } from '@/types/fantasy';
import { useClubsStore } from '@/lib/clubStore';
import { toOptimizedUrl } from '@/lib/cloudinary';

function openCloudinaryWidget(
  folder: string,
  onSuccess: (url: string) => void
) {
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
      folder,
      cropping: true,
      croppingAspectRatio: 1,
      maxFiles: 1,
      resourceType: 'image',
      sources: ['local', 'url'],
    },
    (err: unknown, result: { event?: string; info?: { secure_url?: string } }) => {
      if (!err && result?.event === 'success' && result.info?.secure_url) {
        onSuccess(toOptimizedUrl(result.info.secure_url) ?? result.info.secure_url);
      }
    }
  );
  widget?.open();
}

function CloudinaryLogoWidget({ onUpload }: { onUpload: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => openCloudinaryWidget('kenya-cup/logos', onUpload)}
      className="btn btn-outline"
      style={{ fontSize: '12px', padding: '8px 14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
    >
      <Upload size={14} /> Upload via Cloudinary Widget
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
  onSave: (data: typeof EMPTY_CLUB) => Promise<void>;
}) {
  const [form, setForm] = useState<typeof EMPTY_CLUB>(club ?? { ...EMPTY_CLUB });
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof typeof EMPTY_CLUB>(k: K, v: typeof EMPTY_CLUB[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'auto', maxHeight: '90vh' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{club ? `Edit Club: ${club.name}` : 'Add New Club'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Founded Year</label>
              <input className="input" type="number" value={form.founded_year ?? ''} onChange={e => update('founded_year', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 1995" />
            </div>
          </div>

          {/* Logo Section */}
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <label style={{ ...labelStyle, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ImageIcon size={14} color="var(--gold)" /> Club Logo (Cloudinary / kenya-cup/logos)
            </label>

            {form.logo_url ? (
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.logo_url}
                  alt="Logo preview"
                  style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(0,0,0,0.4)', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                  onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Active Logo Attached
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {form.logo_url}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update('logo_url', null)}
                  className="btn btn-outline"
                  style={{ color: 'var(--danger)', fontSize: '11px', padding: '6px 10px', borderColor: 'rgba(239,68,68,0.3)' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                No logo currently attached. Upload using Cloudinary or paste a direct image URL below.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <CloudinaryLogoWidget onUpload={url => update('logo_url', url)} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LinkIcon size={12} /> Direct URL:
                </span>
                <input
                  className="input"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={form.logo_url ?? ''}
                  onChange={e => update('logo_url', e.target.value.trim() || null)}
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>
            </div>
          </div>

          {/* Active toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.is_active_in_kenya_cup} onChange={e => update('is_active_in_kenya_cup', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} />
            Active in Kenya Cup Season 26/27
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={saving}>Cancel</button>
            <button type="button" onClick={handleSubmit} className="btn btn-gold" disabled={saving}>
              {saving ? <><RefreshCw size={13} className="spin" /> Saving…</> : <><Check size={13} /> {club ? 'Update Club & Save' : 'Add Club & Save'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function ClubRegistry() {
  const { clubs, updateClub, addClub, toggleClubActive, fetchClubs, isLoading } = useClubsStore();
  const [modalClub, setModalClub] = useState<typeof EMPTY_CLUB | null | undefined>(undefined);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (form: typeof EMPTY_CLUB) => {
    try {
      if (modalClub && modalClub.name) {
        await updateClub(modalClub.name, form);
        showToast(`✓ ${form.name} updated and synced to database`);
      } else {
        await addClub(form);
        showToast(`✓ ${form.name} added and synced to database`);
      }
    } catch {
      showToast('Error saving club', 'error');
    }
  };

  const handleQuickUpload = (club: ClubRecord) => {
    openCloudinaryWidget('kenya-cup/logos', async (url) => {
      try {
        await updateClub(club.name, { logo_url: url });
        showToast(`✓ Logo uploaded & saved for ${club.name}`);
      } catch {
        showToast(`Failed to save logo for ${club.name}`, 'error');
      }
    });
  };

  const handleToggle = async (id: string) => {
    await toggleClubActive(id);
  };

  return (
    <div>
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {clubs.length} clubs · {clubs.filter(c => c.is_active_in_kenya_cup).length} active · {clubs.filter(c => !!c.logo_url).length} with logo
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => fetchClubs(true)}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title="Refresh clubs from Supabase"
            disabled={isLoading}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} /> {isLoading ? 'Syncing…' : 'Sync DB'}
          </button>
          <button onClick={() => setModalClub(null)} className="btn btn-gold" style={{ fontSize: '13px' }}>
            <Plus size={14} /> Add Club
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {clubs.map(club => {
          const hasLogo = !!club.logo_url;

          return (
            <div key={club.id || club.name} className="card" style={{
              padding: '16px',
              opacity: club.is_active_in_kenya_cup ? 1 : 0.6,
              border: `1px solid ${hasLogo ? 'rgba(212,175,55,0.3)' : club.is_active_in_kenya_cup ? 'var(--border)' : 'rgba(239,68,68,0.3)'}`,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {/* Logo or color swatch */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '12px',
                    background: `${club.primary_color}18`,
                    border: `2px solid ${club.primary_color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                    padding: hasLogo ? '4px' : '0',
                    boxShadow: hasLogo ? `0 0 14px ${club.primary_color}22` : 'none',
                  }}>
                    {hasLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={club.logo_url!}
                        alt={club.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={e => {
                          // Fallback to text if image URL fails
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontWeight: 900, fontSize: '13px', color: club.primary_color, letterSpacing: '0.04em' }}>
                        {club.abbreviation}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {club.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {club.home_ground ?? 'Ground TBC'}
                    </div>
                    <div style={{ marginTop: '5px' }}>
                      {hasLogo ? (
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#34D399', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                          ✓ LOGO SET
                        </span>
                      ) : (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: '4px' }}>
                          NO LOGO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                {/* Quick Upload Button */}
                <button
                  type="button"
                  onClick={() => handleQuickUpload(club)}
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: '11px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  title="Upload logo directly via Cloudinary"
                >
                  <Upload size={11} /> {hasLogo ? 'Change Logo' : 'Upload Logo'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => setModalClub({ ...EMPTY_CLUB, ...club })}
                  title="Full Edit"
                  style={{ padding: '6px 9px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', cursor: 'pointer', color: '#93C5FD' }}
                >
                  <Pencil size={12} />
                </button>

                {/* Toggle Active */}
                <button
                  onClick={() => handleToggle(club.id)}
                  title={club.is_active_in_kenya_cup ? 'Deactivate' : 'Reactivate'}
                  style={{
                    padding: '6px 9px',
                    background: club.is_active_in_kenya_cup ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${club.is_active_in_kenya_cup ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: club.is_active_in_kenya_cup ? '#FCA5A5' : '#34D399',
                  }}
                >
                  <Power size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', fontSize: '12px', color: '#93C5FD' }}>
        💡 <strong>Synchronized:</strong> Club logos are saved to <code>kenya-cup/logos</code> in Cloudinary and immediately synchronized with Supabase and your local website cache. Changes instantly reflect across Squad Builder, Pitch View, and Player Lists.
      </div>

      {modalClub !== undefined && (
        <ClubModal club={modalClub} onClose={() => setModalClub(undefined)} onSave={handleSave} />
      )}
    </div>
  );
}
