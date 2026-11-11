'use client';
import { useState } from 'react';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLeagueStore } from '@/lib/leagueStore';
import { Camera, Check, Trophy, Shield, ArrowLeft, Loader2, Sparkles, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { email, userId, teamName, avatarUrl, updateProfile } = useAuth();
  const { leagues } = useLeagueStore();

  const [inputTeamName, setInputTeamName] = useState(teamName || 'My Kenya Cup XV');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAvatarSuccess = async (result: CloudinaryUploadWidgetResults) => {
    const uploadedUrl = typeof result?.info === 'object' && result.info ? result.info.secure_url : undefined;
    if (!uploadedUrl) return;

    updateProfile({ avatarUrl: uploadedUrl });

    // Persist to database
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'me',
          avatar_url: uploadedUrl,
        }),
      });
      setSuccessMsg('✓ Manager avatar updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setSuccessMsg('✓ Manager avatar updated locally!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleSaveTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTeamName.trim()) return;

    setIsSaving(true);
    updateProfile({ teamName: inputTeamName.trim() });

    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'me',
          teamName: inputTeamName.trim(),
        }),
      });
      setSuccessMsg('✓ Team name saved!');
    } catch {
      setSuccessMsg('✓ Team name updated locally!');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const myGlobalLeague = leagues[0];
  const myEntry = myGlobalLeague?.members.find(m => m.userId === 'me') || {
    rank: 6,
    totalPoints: 534,
    gameweekPoints: 74,
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Navigation breadcrumb */}
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--gold)',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '28px',
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '100px', marginBottom: '12px' }}>
          <Sparkles size={12} color="var(--gold)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Manager Identity &amp; Profile
          </span>
        </div>
        <h1 className="font-condensed" style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1, margin: 0, color: '#FFF' }}>
          MANAGER PROFILE
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          Personalize your avatar and team name displayed across all Kenya Cup mini-leagues.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ADE80',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Check size={16} />
          {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) 1fr', gap: '28px', alignItems: 'start' }}>

        {/* ── Left Column: Avatar & Quick Info ──────────────────────────────── */}
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 20px' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(59, 130, 246, 0.2))',
              border: '3px solid var(--gold)',
              boxShadow: '0 0 24px rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Manager Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '48px' }}>🏉</span>
              )}
            </div>

            {/* Cloudinary upload trigger */}
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kc_players'}
              options={{
                folder: 'kenya-cup/avatars',
                maxFiles: 1,
                resourceType: 'image',
                cropping: true,
                croppingAspectRatio: 1,
              }}
              onSuccess={handleAvatarSuccess}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  title="Upload Manager Avatar"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    border: '2px solid #0a0e1a',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  <Camera size={18} />
                </button>
              )}
            </CldUploadWidget>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', margin: '0 0 4px' }}>
            {inputTeamName}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {email || 'manager@kenyacup.ke'}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', color: '#4ADE80', fontSize: '11px', fontWeight: 700 }}>
            <UserCheck size={12} />
            Verified Manager
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center' }}>
            <div>
              <div className="font-condensed" style={{ fontSize: '24px', fontWeight: 900, color: 'var(--gold)' }}>
                #{myEntry.rank}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Global Rank
              </div>
            </div>
            <div>
              <div className="font-condensed" style={{ fontSize: '24px', fontWeight: 900, color: '#FFF' }}>
                {myEntry.totalPoints}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Points
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Account & Team Settings Form ────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', margin: '0 0 8px' }}>
              Team &amp; Manager Settings
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.6 }}>
              Update your squad identity. This name is displayed on the Kenya Cup Leaderboard and within private mini-leagues.
            </p>

            <form onSubmit={handleSaveTeamName}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Team Name
                </label>
                <input
                  className="input"
                  value={inputTeamName}
                  onChange={e => setInputTeamName(e.target.value)}
                  placeholder="e.g. Marauder XV, Ngong Warriors"
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Registered Email
                </label>
                <input
                  className="input"
                  value={email || 'manager@kenyacup.ke'}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Managed by Supabase Authentication.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSaving || inputTeamName.trim() === teamName}
                className="btn btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px' }}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Enrolled Leagues summary */}
          <div className="card" style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={18} color="var(--gold)" />
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#FFF' }}>
                  Enrolled Leagues ({leagues.length})
                </h4>
              </div>
              <Link href="/leagues" style={{ fontSize: '12px', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                Manage Leagues →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leagues.map(l => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={14} color="var(--gold)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{l.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {l.type === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

