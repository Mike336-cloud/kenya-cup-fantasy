'use client';
import { useState } from 'react';
import { getKenyaCupLogoCandidates, getKRULogoCandidates } from '@/lib/branding';

interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  overrideUrl?: string | null;
}

/**
 * Official Kenya Cup Tournament Logo
 */
export function KenyaCupLogo({
  size = 40,
  className,
  style,
  overrideUrl,
}: LogoProps) {
  const candidates = getKenyaCupLogoCandidates(overrideUrl);
  const [candidateIdx, setCandidateIdx] = useState(0);

  if (candidateIdx >= candidates.length) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: Math.max(6, Math.round(size * 0.22)),
          background: 'linear-gradient(135deg, #A8891C, #D4AF37, #F0CF6E)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.round(size * 0.48)}px`,
          boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
          ...style,
        }}
      >
        🏉
      </div>
    );
  }

  const currentSrc = candidates[candidateIdx];

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <img
        key={currentSrc}
        src={currentSrc}
        alt="Kenya Cup Official Logo"
        width={size}
        height={size}
        onError={() => setCandidateIdx(idx => idx + 1)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
}

/**
 * Official Kenya Rugby Union (KRU) Federation Crest
 */
export function KRULogo({
  size = 40,
  className,
  style,
  overrideUrl,
}: LogoProps) {
  const candidates = getKRULogoCandidates(overrideUrl);
  const [candidateIdx, setCandidateIdx] = useState(0);

  if (candidateIdx >= candidates.length) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: Math.max(6, Math.round(size * 0.22)),
          background: 'linear-gradient(135deg, #1E3A8A, #059669)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          fontSize: `${Math.max(10, Math.round(size * 0.32))}px`,
          fontWeight: 900,
          letterSpacing: '0.04em',
          ...style,
        }}
      >
        KRU
      </div>
    );
  }

  const currentSrc = candidates[candidateIdx];

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <img
        key={currentSrc}
        src={currentSrc}
        alt="Kenya Rugby Union Logo"
        width={size}
        height={size}
        onError={() => setCandidateIdx(idx => idx + 1)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
        }}
      />
    </div>
  );
}

/**
 * Joint Sanctioned / Partnership Badge
 */
export function OfficialSanctionedBadge({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 14px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '100px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <KenyaCupLogo size={24} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>×</span>
        <KRULogo size={24} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          OFFICIAL FANTASY
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Sanctioned by Kenya Rugby Union
        </span>
      </div>
    </div>
  );
}
