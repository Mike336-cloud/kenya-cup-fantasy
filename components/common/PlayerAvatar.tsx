'use client';
import { useState, useEffect } from 'react';
import { useClubsStore } from '@/lib/clubStore';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';

interface PlayerAvatarProps {
  name: string;
  headshotUrl?: string | null;
  clubName?: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  border?: string;
}

export function PlayerAvatar({
  name,
  headshotUrl,
  clubName,
  size = 40,
  style,
  className,
  border,
}: PlayerAvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [headshotUrl]);

  const getClubMeta = useClubsStore(s => s.getClubMeta);
  const meta = clubName ? getClubMeta(clubName) : { color: 'var(--gold)', bg: 'rgba(212,175,55,0.15)' };

  const finalUrl = cleanCloudinaryUrl(headshotUrl);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const borderColor = border || `2px solid ${meta.color}`;

  if (finalUrl && !hasError) {
    return (
      <div
        suppressHydrationWarning
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          overflow: 'hidden',
          border: borderColor,
          background: 'var(--bg-surface)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxSizing: 'border-box',
          position: 'relative',
          ...style,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={finalUrl}
          alt={name}
          loading="lazy"
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Fallback: Initials with club color
  return (
    <div
      suppressHydrationWarning
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: meta.bg,
        border: borderColor,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.max(10, Math.round(size * 0.36))}px`,
        fontWeight: 800,
        color: meta.color,
        flexShrink: 0,
        userSelect: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
