'use client';
import { useState } from 'react';
import { useClubsStore } from '@/lib/clubStore';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';

interface ClubLogoProps {
  clubName: string;
  size?: number;
  logoUrl?: string | null;
  style?: React.CSSProperties;
  className?: string;
  showBorder?: boolean;
}

export function ClubLogo({
  clubName,
  size = 36,
  logoUrl,
  style,
  className,
  showBorder = true,
}: ClubLogoProps) {
  const [hasError, setHasError] = useState(false);
  const clubs = useClubsStore(s => s.clubs);
  const getClubMeta = useClubsStore(s => s.getClubMeta);
  const meta = getClubMeta(clubName);
  const matched = clubs.find(
    c => c.name.toLowerCase() === clubName?.toLowerCase() || c.abbreviation.toLowerCase() === clubName?.toLowerCase()
  );

  const rawUrl = logoUrl !== undefined ? logoUrl : (matched?.logo_url || meta.logo);
  const finalLogo = cleanCloudinaryUrl(rawUrl);

  const borderRadius = Math.max(6, Math.round(size * 0.22));
  const padding = Math.max(2, Math.round(size * 0.08));

  if (finalLogo && !hasError) {
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
          borderRadius: `${borderRadius}px`,
          background: 'rgba(255, 255, 255, 0.06)',
          border: showBorder ? `1.5px solid ${meta.color}55` : 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          padding: `${padding}px`,
          boxSizing: 'border-box',
          position: 'relative',
          ...style,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={finalLogo}
          alt={`${clubName} logo`}
          loading="lazy"
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Fallback: Styled Abbreviation Badge
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
        borderRadius: `${borderRadius}px`,
        background: meta.bg,
        border: showBorder ? `1.5px solid ${meta.color}88` : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: meta.color,
        fontWeight: 900,
        fontSize: `${Math.max(9, Math.round(size * 0.34))}px`,
        letterSpacing: '0.04em',
        flexShrink: 0,
        userSelect: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
      title={clubName}
    >
      {meta.abbr}
    </div>
  );
}
