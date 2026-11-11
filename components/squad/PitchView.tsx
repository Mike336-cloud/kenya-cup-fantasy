'use client';
import { useState } from 'react';
import { Plus, X, Crown, Star, Zap, Users, Repeat, Trash2, AlertCircle, Check, ArrowLeftRight, Lock } from 'lucide-react';
import { useSquadStore } from '@/store/squadStore';
import { useClubsStore } from '@/lib/clubStore';
import { usePlayersStore } from '@/lib/playerStore';
import { ClubLogo } from '@/components/common/ClubLogo';
import { formatCost, isPlayerLocked } from '@/lib/fantasyRules';
import { cleanCloudinaryUrl } from '@/lib/cloudinary';
import { Player, BoosterType, SquadPlayer } from '@/types/fantasy';

// ─────────────────────────────────────────────────────────────────────────────
// Perfectly Symmetrical 12-Column Rugby Union 1–15 Formation Layout
// Columns: 12 total. Exact center spine = Columns 6 & 7.
// Left half (Cols 1–5), Center (Cols 6–7), Right half (Cols 8–12).
// Both sides have mathematically identical margins and spacing.
// ─────────────────────────────────────────────────────────────────────────────
export const FORMATION: {
  jersey: number;
  label: string;
  position: string;
  acceptedPositions: string[];
  row: number;
  col: number;
  span: number;
}[] = [
  // Front Row (Row 1) — LH Prop (1), Hooker (2), TH Prop (3)
  { jersey: 1, label: 'LH Prop',    position: 'Loosehead Prop', acceptedPositions: ['Loosehead Prop', 'Front Row', 'Prop'], row: 1, col: 2, span: 2 },
  { jersey: 2, label: 'Hooker',     position: 'Hooker',         acceptedPositions: ['Hooker', 'Front Row'],                   row: 1, col: 6, span: 2 },
  { jersey: 3, label: 'TH Prop',    position: 'Tighthead Prop', acceptedPositions: ['Tighthead Prop', 'Front Row', 'Prop'], row: 1, col: 10, span: 2 },

  // Second Row (Row 2) — Locks (4, 5)
  { jersey: 4, label: 'Lock',       position: 'Lock',           acceptedPositions: ['Lock'],                                  row: 2, col: 4, span: 2 },
  { jersey: 5, label: 'Lock',       position: 'Lock',           acceptedPositions: ['Lock'],                                  row: 2, col: 8, span: 2 },

  // Back Row (Row 3) — Flanker (6), Number 8 (8), Flanker (7)
  { jersey: 6, label: 'Blindside',  position: 'Blindside Flanker', acceptedPositions: ['Blindside Flanker', 'Openside Flanker', 'Back Row', 'Flanker'], row: 3, col: 2, span: 2 },
  { jersey: 8, label: 'Number 8',   position: 'Number 8',          acceptedPositions: ['Number 8', 'Back Row'],                                           row: 3, col: 6, span: 2 },
  { jersey: 7, label: 'Openside',   position: 'Openside Flanker',  acceptedPositions: ['Blindside Flanker', 'Openside Flanker', 'Back Row', 'Flanker'], row: 3, col: 10, span: 2 },

  // Half-backs (Row 4) — Scrum-half (9), Fly-half (10)
  { jersey: 9, label: 'Scrum-half', position: 'Scrum-half',     acceptedPositions: ['Scrum-half'],                            row: 4, col: 4, span: 2 },
  { jersey: 10,label: 'Fly-half',   position: 'Fly-half',       acceptedPositions: ['Fly-half'],                              row: 4, col: 8, span: 2 },

  // Centers (Row 5) — Inside Ctr (12), Outside Ctr (13)
  { jersey: 12,label: 'Inside Ctr', position: 'Inside Center',  acceptedPositions: ['Inside Center', 'Outside Center', 'Utility Back', 'Center'], row: 5, col: 4, span: 2 },
  { jersey: 13,label: 'Outside Ctr',position: 'Outside Center', acceptedPositions: ['Inside Center', 'Outside Center', 'Utility Back', 'Center'], row: 5, col: 8, span: 2 },

  // Back Three (Row 6) — L Wing (11), Full-back (15), R Wing (14)
  { jersey: 11,label: 'L Wing',     position: 'Left Wing',      acceptedPositions: ['Left Wing', 'Right Wing', 'Utility Back', 'Wing'], row: 6, col: 2, span: 2 },
  { jersey: 15,label: 'Fullback',   position: 'Fullback',       acceptedPositions: ['Fullback', 'Utility Back', 'Full-back'],           row: 6, col: 6, span: 2 },
  { jersey: 14,label: 'R Wing',     position: 'Right Wing',     acceptedPositions: ['Left Wing', 'Right Wing', 'Utility Back', 'Wing'], row: 6, col: 10, span: 2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rugby Union Substitutes Bench (Jerseys 16–23)
// 8 Reserves: 16 Reserve Hooker, 17 Reserve Prop, 18 Reserve Prop,
// 19 Reserve Lock, 20 Reserve Back Row, 21 Reserve Scrum-half,
// 22 Reserve Inside Back, 23 Reserve Outside Back.
// ─────────────────────────────────────────────────────────────────────────────
export const BENCH_FORMATION: {
  jersey: number;
  label: string;
  position: string;
  acceptedPositions: string[];
}[] = [
  { jersey: 16, label: 'Reserve Hooker',      position: 'Hooker',        acceptedPositions: ['Hooker', 'Front Row'] },
  { jersey: 17, label: 'Reserve Prop',        position: 'Front Row',     acceptedPositions: ['Loosehead Prop', 'Tighthead Prop', 'Front Row', 'Prop'] },
  { jersey: 18, label: 'Reserve Prop',        position: 'Front Row',     acceptedPositions: ['Loosehead Prop', 'Tighthead Prop', 'Front Row', 'Prop'] },
  { jersey: 19, label: 'Reserve Lock',        position: 'Lock',          acceptedPositions: ['Lock'] },
  { jersey: 20, label: 'Reserve Back Row',    position: 'Back Row',      acceptedPositions: ['Blindside Flanker', 'Openside Flanker', 'Number 8', 'Back Row', 'Flanker'] },
  { jersey: 21, label: 'Reserve Scrum-half',  position: 'Scrum-half',    acceptedPositions: ['Scrum-half'] },
  { jersey: 22, label: 'Reserve Inside Back', position: 'Inside Back',   acceptedPositions: ['Fly-half', 'Inside Center', 'Outside Center', 'Utility Back', 'Center'] },
  { jersey: 23, label: 'Reserve Outside Back',position: 'Outside Back',  acceptedPositions: ['Left Wing', 'Right Wing', 'Fullback', 'Utility Back', 'Wing', 'Full-back'] },
];

export function isPositionEligibleForSlot(slotJersey: number, playerPosition?: string): boolean {
  if (!playerPosition) return false;
  const startSlot = FORMATION.find(s => s.jersey === slotJersey);
  if (startSlot) {
    return startSlot.acceptedPositions.includes(playerPosition);
  }
  const benchSlot = BENCH_FORMATION.find(b => b.jersey === slotJersey);
  if (benchSlot) {
    return benchSlot.acceptedPositions.includes(playerPosition);
  }
  return true;
}

export function getAcceptedPositionsForSlot(slotJersey: number): string[] {
  const startSlot = FORMATION.find(s => s.jersey === slotJersey);
  if (startSlot) return startSlot.acceptedPositions;
  const benchSlot = BENCH_FORMATION.find(b => b.jersey === slotJersey);
  if (benchSlot) return benchSlot.acceptedPositions;
  return [];
}

const BOOSTERS = [
  { id: 'triple',      icon: Crown,   label: 'Triple Captain',  short: '3×C',  color: '#F59E0B', bg: 'rgba(245,158,11,0.2)' },
  { id: 'limit',       icon: Zap,     label: 'Limitless',       short: 'LIM',  color: '#A855F7', bg: 'rgba(168,85,247,0.2)' },
  { id: 'co',          icon: Users,   label: 'Co-Captains',     short: 'CO-C', color: '#3B82F6', bg: 'rgba(59,130,246,0.2)' },
  { id: 'BENCH_BOOST', icon: Repeat,  label: 'Bench Boost',     short: 'BB',   color: '#10B981', bg: 'rgba(16,185,129,0.2)' },
];

export function isBoosterActive(boosterId: string, currentBooster: BoosterType | null): boolean {
  if (!currentBooster) return false;
  if (boosterId === currentBooster) return true;
  if (boosterId === 'BENCH_BOOST' && currentBooster === 'bench') return true;
  if (boosterId === 'bench' && currentBooster === 'BENCH_BOOST') return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D H-Shaped Rugby Goalposts Component
// Positioned directly on the try line center (50% left) and counter-rotated upright
// ─────────────────────────────────────────────────────────────────────────────
function RugbyGoalPosts({ isTop }: { isTop: boolean }) {
  const topPos = isTop ? '5.2%' : '94.8%';

  return (
    <div style={{
      position: 'absolute',
      top: topPos,
      left: '50%',
      transform: `translateX(-50%) translateY(${isTop ? '-90%' : '-10%'}) rotateX(-26deg)`,
      transformOrigin: '50% 100%',
      zIndex: 15,
      pointerEvents: 'none',
      filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.5))',
    }}>
      <svg width="90" height="84" viewBox="0 0 90 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Post Upright */}
        <line x1="22" y1="80" x2="22" y2="4" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        {/* Right Post Upright */}
        <line x1="68" y1="80" x2="68" y2="4" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        {/* Horizontal Crossbar */}
        <line x1="20" y1="42" x2="70" y2="42" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

        {/* Kenya Cup Post Pads at base */}
        <rect x="18" y="64" width="8" height="18" rx="2" fill="#DC2626" stroke="#FEF08A" strokeWidth="1" />
        <rect x="64" y="64" width="8" height="18" rx="2" fill="#DC2626" stroke="#FEF08A" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accurate Symmetrical Rugby Pitch Markings SVG
// Coords: 1200w × 1400h. Center is x = 600.
// ─────────────────────────────────────────────────────────────────────────────
function RugbyPitchMarkingsSVG() {
  return (
    <svg
      viewBox="0 0 1200 1400"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern id="deadBallStripe" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(255,255,255,0.035)" strokeWidth="6" />
        </pattern>
      </defs>

      {/* ── Top Dead Ball Area (In-Goal) ─────────────────────────────────── */}
      <rect x="60" y="20" width="1080" height="75" fill="url(#deadBallStripe)" />
      <text x="600" y="62" fill="rgba(255,255,255,0.18)" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="8">
        DEAD BALL AREA · IN-GOAL
      </text>

      {/* ── Bottom Dead Ball Area (In-Goal) ──────────────────────────────── */}
      <rect x="60" y="1305" width="1080" height="75" fill="url(#deadBallStripe)" />
      <text x="600" y="1350" fill="rgba(255,255,255,0.18)" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="8">
        DEAD BALL AREA · IN-GOAL
      </text>

      {/* ── Outer Boundaries (Touchlines & Dead Ball Lines) ───────────────── */}
      <rect x="60" y="20" width="1080" height="1360" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />

      {/* ── Top Try Line (Solid 4px White) ───────────────────────────────── */}
      <line x1="60" y1="95" x2="1140" y2="95" stroke="#FFFFFF" strokeWidth="4" />

      {/* ── Bottom Try Line (Solid 4px White) ────────────────────────────── */}
      <line x1="60" y1="1305" x2="1140" y2="1305" stroke="#FFFFFF" strokeWidth="4" />

      {/* ── 5m Lines Parallel to Try Lines (Dashed) ──────────────────────── */}
      <line x1="60" y1="160" x2="1140" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="14 12" />
      <line x1="60" y1="1240" x2="1140" y2="1240" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="14 12" />

      {/* ── 22-Meter Lines (Solid White) ─────────────────────────────────── */}
      <line x1="60" y1="375" x2="1140" y2="375" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" />
      <text x="90" y="367" fill="rgba(255,255,255,0.4)" fontSize="18" fontWeight="800">22m</text>
      <text x="1110" y="367" fill="rgba(255,255,255,0.4)" fontSize="18" fontWeight="800" textAnchor="end">22m</text>

      <line x1="60" y1="1025" x2="1140" y2="1025" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" />
      <text x="90" y="1017" fill="rgba(255,255,255,0.4)" fontSize="18" fontWeight="800">22m</text>
      <text x="1110" y="1017" fill="rgba(255,255,255,0.4)" fontSize="18" fontWeight="800" textAnchor="end">22m</text>

      {/* ── 10-Meter Lines (Dashed White) ────────────────────────────────── */}
      <line x1="60" y1="560" x2="1140" y2="560" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="16 14" />
      <text x="90" y="552" fill="rgba(255,255,255,0.35)" fontSize="16" fontWeight="800">10m</text>
      <text x="1110" y="552" fill="rgba(255,255,255,0.35)" fontSize="16" fontWeight="800" textAnchor="end">10m</text>

      <line x1="60" y1="840" x2="1140" y2="840" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="16 14" />
      <text x="90" y="832" fill="rgba(255,255,255,0.35)" fontSize="16" fontWeight="800">10m</text>
      <text x="1110" y="832" fill="rgba(255,255,255,0.35)" fontSize="16" fontWeight="800" textAnchor="end">10m</text>

      {/* ── Half-Way Line (Solid White) & Centre Circle ──────────────────── */}
      <line x1="60" y1="700" x2="1140" y2="700" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="600" cy="700" r="75" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <circle cx="600" cy="700" r="5" fill="rgba(255,255,255,0.8)" />

      {/* ── 5m and 15m Dashed Lines Parallel to Touchlines ────────────────── */}
      {/* Left 5m line */}
      <line x1="150" y1="95" x2="150" y2="1305" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeDasharray="14 14" />
      <text x="150" y="85" fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="800" textAnchor="middle">5m</text>

      {/* Left 15m line */}
      <line x1="330" y1="95" x2="330" y2="1305" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeDasharray="14 14" />
      <text x="330" y="85" fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="800" textAnchor="middle">15m</text>

      {/* Right 15m line */}
      <line x1="870" y1="95" x2="870" y2="1305" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeDasharray="14 14" />
      <text x="870" y="85" fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="800" textAnchor="middle">15m</text>

      {/* Right 5m line */}
      <line x1="1050" y1="95" x2="1050" y2="1305" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeDasharray="14 14" />
      <text x="1050" y="85" fill="rgba(255,255,255,0.25)" fontSize="12" fontWeight="800" textAnchor="middle">5m</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-Featured Player Action Modal with Tactical Starter ⇄ Bench Swaps
// Un-skewed, centered, high z-index with large, easily clickable buttons
// ─────────────────────────────────────────────────────────────────────────────
interface PlayerActionModalProps {
  player: Player;
  slotJersey: number;
  slotPosition: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  activeBooster: BoosterType | null;
  allSquad: SquadPlayer[];
  initialTab?: 'roles' | 'swap';
  onClose: () => void;
  onSetCaptain: (player: Player) => void;
  onSetViceCaptain: (player: Player) => void;
  onRemove: (player: Player) => void;
  onSwap: (sourceId: string, targetId: string) => { success: boolean; error?: string };
}

function PlayerActionModal({
  player,
  slotJersey,
  slotPosition,
  isCaptain,
  isViceCaptain,
  activeBooster,
  allSquad,
  initialTab = 'roles',
  onClose,
  onSetCaptain,
  onSetViceCaptain,
  onRemove,
  onSwap,
}: PlayerActionModalProps) {
  const getClubMeta = useClubsStore(s => s.getClubMeta);
  const clubMeta = getClubMeta(player.club);
  const [activeTab, setActiveTab] = useState<'roles' | 'swap'>(initialTab);
  const [swapError, setSwapError] = useState<string | null>(null);

  const isStarter = slotJersey <= 15;
  const currentSquadPlayer = allSquad.find(s => String(s.playerId) === String(player.id));
  const isCurrentLocked = isPlayerLocked(player) || !!currentSquadPlayer?.isLocked;
  const isBenchBoostOn = activeBooster === 'BENCH_BOOST' || activeBooster === 'bench';

  // Opposite roster candidates (Starter ⇄ Bench)
  const swapCandidates = allSquad.filter(sp => {
    if (String(sp.playerId) === String(player.id)) return false;
    if (isStarter) {
      return sp.pitchSlot > 15; // Bench reserves (16–23)
    } else {
      return sp.pitchSlot <= 15; // Starting XV (1–15)
    }
  });

  const handleExecuteSwap = (targetPlayerId: string) => {
    setSwapError(null);
    const result = onSwap(String(player.id), String(targetPlayerId));
    if (!result.success) {
      setSwapError(result.error || 'Failed to complete tactical swap.');
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #131E17 0%, #0B130E 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(16, 185, 129, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Player Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: `2.5px solid ${isCaptain ? 'var(--gold)' : isViceCaptain ? '#8B5CF6' : clubMeta?.color ?? '#FFF'}`,
                background: clubMeta?.bg ?? 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: isCaptain
                  ? '0 0 16px rgba(212,175,55,0.6)'
                  : isViceCaptain
                  ? '0 0 16px rgba(139,92,246,0.6)'
                  : '0 4px 14px rgba(0,0,0,0.5)',
              }}
            >
              {player.headshot_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanCloudinaryUrl(player.headshot_url)!}
                  alt={player.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '18px', fontWeight: 900, color: clubMeta?.color ?? '#FFF' }}>
                  {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#FFF',
                    background: isStarter ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)',
                    border: `1px solid ${isStarter ? 'rgba(16,185,129,0.5)' : 'rgba(59,130,246,0.5)'}`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  #{slotJersey} {isStarter ? 'Starter' : 'Reserve'}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {slotPosition}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)' }}>
                  {formatCost(player.cost)}
                </span>
              </div>

              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFF',
                  margin: 0,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {player.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <ClubLogo clubName={player.club} logoUrl={player.clubs?.logo_url || player.club_logo_url} size={15} showBorder={false} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {player.club}
                </span>
              </div>
            </div>
          </div>

          {/* Lockout Warning Banner if match kicked off */}
          {isCurrentLocked && (
            <div
              style={{
                marginBottom: '14px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid rgba(239, 68, 68, 0.45)',
                color: '#FCA5A5',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lock size={15} color="#EF4444" />
              <span>🔒 Lockout Active: Match kicked off! Swapping is disabled for this player.</span>
            </div>
          )}

          {/* Current Role Notice */}
          <div style={{ marginBottom: '16px' }}>
            {isCaptain ? (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  color: '#FCD34D',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Crown size={15} color="var(--gold)" />
                <span>👑 Designated Captain — 2× points ({activeBooster === 'triple' ? '3× Triple Captain!' : 'Standard'})</span>
              </div>
            ) : isViceCaptain ? (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1.5px solid rgba(139, 92, 246, 0.4)',
                  color: '#C4B5FD',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Star size={15} color="#8B5CF6" />
                <span>⭐ Vice-Captain (Assistant) — {activeBooster === 'co' ? 'Co-Captains: 2× points!' : 'Captain replacement'}</span>
              </div>
            ) : isStarter ? (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#6EE7B7',
                  fontSize: '12px',
                }}
              >
                🟢 Starting XV Player · 1× standard matchday points
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: isBenchBoostOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isBenchBoostOn ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isBenchBoostOn ? '#34D399' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: isBenchBoostOn ? 700 : 500,
                }}
              >
                {isBenchBoostOn ? '⚡ Bench Boost Active: This substitute scores fantasy points!' : '🔄 Substitutes Bench: Scores 0 pts unless Bench Boost is active.'}
              </div>
            )}
          </div>

          {/* Navigation Tabs: Roles vs Tactical Swap */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: activeTab === 'roles' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${activeTab === 'roles' ? '#10B981' : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === 'roles' ? '#FFF' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s',
              }}
            >
              <Crown size={14} color={activeTab === 'roles' ? '#10B981' : 'currentColor'} />
              <span>Roles & Actions</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('swap')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: activeTab === 'swap' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${activeTab === 'swap' ? '#10B981' : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === 'swap' ? '#34D399' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s',
              }}
            >
              <ArrowLeftRight size={14} color={activeTab === 'swap' ? '#10B981' : 'currentColor'} />
              <span>Tactical Swap ⇄</span>
            </button>
          </div>

          {/* Swap Error Banner */}
          {swapError && (
            <div
              style={{
                marginBottom: '14px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} />
              <span>{swapError}</span>
            </div>
          )}

          {/* TAB 1: Roles & Actions */}
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* ── SET CAPTAIN BUTTON ── */}
              <button
                type="button"
                onClick={() => {
                  onSetCaptain(player);
                  onClose();
                }}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: isCaptain ? '2px solid #F59E0B' : '1.5px solid rgba(245, 158, 11, 0.4)',
                  background: isCaptain
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(217,119,6,0.3) 100%)'
                    : 'rgba(245, 158, 11, 0.08)',
                  color: '#FBBF24',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s',
                  boxShadow: isCaptain ? '0 0 20px rgba(245,158,11,0.35)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Crown size={20} color="#F59E0B" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                      {isCaptain ? '✓ Assigned as Captain' : 'Make Captain (2× Points)'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      Multiplies points by 2× (or 3× with Triple Captain chip)
                    </div>
                  </div>
                </div>
                {isCaptain && <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--gold)' }}>ACTIVE</span>}
              </button>

              {/* ── SET VICE-CAPTAIN BUTTON ── */}
              <button
                type="button"
                onClick={() => {
                  onSetViceCaptain(player);
                  onClose();
                }}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: isViceCaptain ? '2px solid #8B5CF6' : '1.5px solid rgba(139, 92, 246, 0.45)',
                  background: isViceCaptain
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(109,40,217,0.3) 100%)'
                    : 'rgba(139, 92, 246, 0.1)',
                  color: '#C4B5FD',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s',
                  boxShadow: isViceCaptain ? '0 0 20px rgba(139,92,246,0.35)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Star size={20} color="#8B5CF6" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                      {isViceCaptain ? '✓ Assigned as Vice-Captain' : 'Make Vice-Captain (Assistant)'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      Replaces Captain if absent · Enables Co-Captains (2×) chip
                    </div>
                  </div>
                </div>
                {isViceCaptain && <span style={{ fontSize: '12px', fontWeight: 900, color: '#8B5CF6' }}>ACTIVE</span>}
              </button>

              {/* ── SWITCH TO SWAP BUTTON SHORTCUT ── */}
              <button
                type="button"
                onClick={() => setActiveTab('swap')}
                style={{
                  width: '100%',
                  minHeight: '46px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(16, 185, 129, 0.35)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#34D399',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.15s',
                }}
              >
                <ArrowLeftRight size={16} />
                <span>Swap with {isStarter ? 'Bench Reserve' : 'Starter'}</span>
              </button>

              {/* ── REMOVE PLAYER BUTTON ── */}
              <button
                type="button"
                onClick={() => {
                  onRemove(player);
                  onClose();
                }}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#F87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginTop: '4px',
                  transition: 'background 0.15s',
                }}
              >
                <Trash2 size={15} />
                <span>Remove {player.name.split(' ').slice(-1)[0]} from Squad</span>
              </button>
            </div>
          )}

          {/* TAB 2: Tactical Swap Candidates */}
          {activeTab === 'swap' && (
            <div>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#CBD5E1' }}>
                  Select player to swap with {player.name.split(' ').slice(-1)[0]}:
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {swapCandidates.length} eligible
                </span>
              </div>

              {swapCandidates.length === 0 ? (
                <div style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                }}>
                  No opposite-roster players available to swap. Fill your {isStarter ? 'bench' : 'starting'} slots first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {swapCandidates.map(cand => {
                    const cMeta = getClubMeta(cand.player.club);
                    const isCandLocked = isPlayerLocked(cand.player) || !!cand.isLocked;
                    const isStarterSlotCompatible = isStarter
                      ? isPositionEligibleForSlot(slotJersey, cand.player.position)
                      : isPositionEligibleForSlot(cand.pitchSlot, player.position);
                    const isBenchSlotCompatible = isStarter
                      ? isPositionEligibleForSlot(cand.pitchSlot, player.position)
                      : isPositionEligibleForSlot(slotJersey, cand.player.position);
                    const isPositionCompatible = isStarterSlotCompatible && isBenchSlotCompatible;
                    const canSwap = !isCurrentLocked && !isCandLocked && isPositionCompatible;

                    return (
                      <div
                        key={cand.playerId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: canSwap ? 'rgba(255,255,255,0.04)' : 'rgba(239,68,68,0.05)',
                          border: `1px solid ${canSwap ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)'}`,
                          opacity: canSwap ? 1 : 0.6,
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              border: `1.5px solid ${cMeta?.color ?? '#FFF'}`,
                              background: cMeta?.bg ?? 'rgba(0,0,0,0.5)',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {cand.player.headshot_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cleanCloudinaryUrl(cand.player.headshot_url)!}
                                alt={cand.player.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFF' }}>
                                #{cand.pitchSlot}
                              </span>
                            )}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gold)' }}>
                                #{cand.pitchSlot}
                              </span>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cand.player.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)' }}>
                                {cand.player.position}
                              </span>
                              <span style={{ fontSize: '10px', color: cMeta?.color, fontWeight: 700 }}>
                                · {cand.player.club}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Swap action button */}
                        <div>
                          {isCandLocked ? (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#FCA5A5',
                              background: 'rgba(239,68,68,0.2)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <Lock size={11} /> Locked
                            </span>
                          ) : !isPositionCompatible ? (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#FCA5A5',
                              background: 'rgba(239,68,68,0.15)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }} title="Position not eligible for this tactical slot">
                              Invalid Pos
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleExecuteSwap(cand.playerId)}
                              disabled={!canSwap}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                border: 'none',
                                color: '#FFF',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                              }}
                            >
                              <ArrowLeftRight size={12} />
                              <span>Swap ⇄</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BenchSlotCard Component for Substitutes Bench (Jerseys 16–23)
// ─────────────────────────────────────────────────────────────────────────────
interface BenchSlotCardProps {
  slot: typeof BENCH_FORMATION[0];
  player: Player | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  activeBooster: BoosterType | null;
  onAdd: () => void;
  onSelectForAction: (player: Player) => void;
  onQuickSwap: (player: Player) => void;
}

function BenchSlotCard({
  slot,
  player,
  isCaptain,
  isViceCaptain,
  activeBooster,
  onAdd,
  onSelectForAction,
  onQuickSwap,
}: BenchSlotCardProps) {
  const [failedHeadshotUrl, setFailedHeadshotUrl] = useState<string | null>(null);
  const headshotFailed = Boolean(player?.headshot_url && failedHeadshotUrl === player.headshot_url);
  const getClubMeta = useClubsStore(s => s.getClubMeta);
  const clubMeta = player ? getClubMeta(player.club) : null;
  const isBenchBoostOn = activeBooster === 'BENCH_BOOST' || activeBooster === 'bench';
  const isLocked = player ? isPlayerLocked(player) : false;

  if (!player) {
    return (
      <div
        style={{
          borderRadius: '12px',
          border: '1.5px dashed rgba(255, 255, 255, 0.2)',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '12px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '142px',
          textAlign: 'center',
          transition: 'all 0.2s',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(0,0,0,0.6)',
            padding: '1px 5px',
            borderRadius: '4px',
            marginBottom: '6px',
          }}
        >
          #{slot.jersey}
        </span>
        <button
          type="button"
          onClick={onAdd}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.05)',
            color: '#CBD5E1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '6px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.background = 'rgba(212,175,55,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          <Plus size={16} />
        </button>
        <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>
          {slot.label}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectForAction(player)}
      style={{
        borderRadius: '12px',
        border: `1.5px solid ${isCaptain ? 'var(--gold)' : isViceCaptain ? '#8B5CF6' : isBenchBoostOn ? '#10B981' : 'rgba(255, 255, 255, 0.12)'}`,
        background: 'linear-gradient(180deg, #132418 0%, #0a140d 100%)',
        padding: '10px 6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '142px',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: isBenchBoostOn ? '0 0 12px rgba(16,185,129,0.2)' : '0 4px 10px rgba(0,0,0,0.4)',
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Top Header: Jersey # + Status Badge */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 900,
            color: '#FFF',
            background: 'rgba(0,0,0,0.7)',
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          #{slot.jersey}
        </span>
        {isLocked ? (
          <span style={{ color: '#EF4444' }} title="Match started — Locked">
            <Lock size={11} />
          </span>
        ) : isCaptain ? (
          <Crown size={11} color="var(--gold)" />
        ) : isViceCaptain ? (
          <Star size={11} color="#8B5CF6" />
        ) : isBenchBoostOn ? (
          <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#10B981', background: 'rgba(16,185,129,0.2)', padding: '1px 3px', borderRadius: '3px' }}>
            BB
          </span>
        ) : null}
      </div>

      {/* Avatar */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: `1.5px solid ${isCaptain ? 'var(--gold)' : isViceCaptain ? '#8B5CF6' : isBenchBoostOn ? '#10B981' : clubMeta?.color ?? '#FFF'}`,
          background: clubMeta?.bg ?? 'rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2px 0 4px',
          flexShrink: 0,
        }}
      >
        {player.headshot_url && !headshotFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cleanCloudinaryUrl(player.headshot_url)!}
            alt={player.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setFailedHeadshotUrl(player.headshot_url || null)}
          />
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFF' }}>
            {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        )}
      </div>

      {/* Player Name & Info */}
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#FFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {player.name.split(' ').slice(-1)[0]}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '2px' }}>
          <ClubLogo
            clubName={player.club}
            logoUrl={player.clubs?.logo_url || player.club_logo_url}
            size={10}
            showBorder={false}
          />
          <span style={{ fontSize: '8px', color: clubMeta?.color, fontWeight: 700 }}>{clubMeta?.abbr}</span>
        </div>
        <div style={{ fontSize: '8px', color: 'var(--gold)', fontWeight: 800, marginTop: '1px' }}>
          {formatCost(player.cost)}
        </div>
      </div>

      {/* Quick Swap Pill */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onQuickSwap(player);
        }}
        disabled={isLocked}
        style={{
          marginTop: '4px',
          width: '100%',
          padding: '2px 4px',
          borderRadius: '5px',
          background: isLocked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isLocked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)'}`,
          color: isLocked ? '#FCA5A5' : '#CBD5E1',
          fontSize: '8px',
          fontWeight: 800,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
        }}
      >
        {isLocked ? <Lock size={9} /> : <ArrowLeftRight size={9} />}
        <span>{isLocked ? 'Locked' : 'Swap ⇄'}</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PitchSlot Component
// Counter-rotates player upright and scales gracefully on mobile
// ─────────────────────────────────────────────────────────────────────────────
interface PitchSlotProps {
  slot: typeof FORMATION[0];
  player: Player | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  activeBooster: BoosterType | null;
  onAdd: () => void;
  onSelectForAction: (player: Player) => void;
}

function PitchSlot({ slot, player, isCaptain, isViceCaptain, activeBooster, onAdd, onSelectForAction }: PitchSlotProps) {
  const [failedHeadshotUrl, setFailedHeadshotUrl] = useState<string | null>(null);
  const headshotFailed = Boolean(player?.headshot_url && failedHeadshotUrl === player.headshot_url);

  const getClubMeta = useClubsStore(s => s.getClubMeta);
  const clubMeta = player ? getClubMeta(player.club) : null;

  // Resolve player match status
  const matchStatus = player?.matchStatus || (player?.isInjured ? 'injured' : player?.isSuspended ? 'suspended' : 'starting');
  const isBench = matchStatus === 'bench';
  const isInjured = matchStatus === 'injured' || !!player?.isInjured;
  const isSuspended = matchStatus === 'suspended' || !!player?.isSuspended;

  // Compute Captain badge text & styling depending on active boost
  let captainBadgeText = 'C';
  let captainBadgeBg = 'var(--gold)';
  let captainBadgeColor = '#000';
  let captainGlow = 'rgba(212,175,55,0.8)';

  if (isCaptain) {
    if (activeBooster === 'triple') {
      captainBadgeText = '3×';
      captainBadgeBg = 'linear-gradient(135deg, #F59E0B, #DC2626)';
      captainBadgeColor = '#FFF';
      captainGlow = 'rgba(245,158,11,0.9)';
    } else if (activeBooster === 'co') {
      captainBadgeText = '2×';
      captainBadgeBg = '#F59E0B';
      captainBadgeColor = '#000';
    }
  } else if (isViceCaptain) {
    if (activeBooster === 'co') {
      captainBadgeText = '2×';
      captainBadgeBg = '#3B82F6';
      captainBadgeColor = '#FFF';
      captainGlow = 'rgba(59,130,246,0.9)';
    } else {
      captainBadgeText = 'V';
      captainBadgeBg = '#8B5CF6';
      captainBadgeColor = '#000';
      captainGlow = 'rgba(139,92,246,0.8)';
    }
  }

  return (
    <div style={{
      gridRow: slot.row,
      gridColumn: `${slot.col} / span ${slot.span}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transformStyle: 'preserve-3d',
    }}>
      {/* ── Billboarding element: upright counter-rotation ────────────────── */}
      <div style={{
        transform: 'rotateX(-26deg)',
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 85%',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
      }}>
        {player ? (
          // Filled Slot
          <div
            onClick={() => onSelectForAction(player)}
            title={`Tap to manage ${player.name}`}
            style={{
              position: 'relative',
              textAlign: 'center',
              width: 'clamp(62px, 11vw, 84px)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {/* Captain / VC Badge */}
            {(isCaptain || isViceCaptain) && (
              <div style={{
                position: 'absolute', top: '-7px', right: '-4px', zIndex: 32,
                minWidth: '22px', height: '22px', padding: '0 3px', borderRadius: '11px',
                background: captainBadgeBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 12px ${captainGlow}`,
                fontSize: '9.5px', fontWeight: 900, color: captainBadgeColor,
                border: '1.5px solid #000',
              }}>
                {captainBadgeText}
              </div>
            )}

            {/* Match Status Badge: Bench (+50% bonus if active), Injured, Suspended */}
            {(isBench || isInjured || isSuspended) && (
              <div style={{
                position: 'absolute', top: '-7px', left: '-5px', zIndex: 32,
                padding: '1px 4px', borderRadius: '4px',
                background: isInjured ? '#EF4444' : isSuspended ? '#F59E0B' : (activeBooster === 'bench' ? '#10B981' : 'rgba(16,185,129,0.9)'),
                color: '#FFFFFF',
                boxShadow: isInjured
                  ? '0 0 8px rgba(239,68,68,0.8)'
                  : activeBooster === 'bench' && isBench
                  ? '0 0 10px rgba(16,185,129,0.9)'
                  : '0 2px 5px rgba(0,0,0,0.5)',
                fontSize: '8px', fontWeight: 900, letterSpacing: '0.04em',
                border: '1px solid rgba(0,0,0,0.5)',
              }}>
                {isInjured ? 'INJ' : isSuspended ? 'SUSP' : (activeBooster === 'bench' ? 'BB+50%' : 'SUB')}
              </div>
            )}

            {/* Avatar Circle with Headshot */}
            <div
              style={{
                width: 'clamp(48px, 9vw, 62px)',
                height: 'clamp(48px, 9vw, 62px)',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                border: `2px solid ${isCaptain ? 'var(--gold)' : isViceCaptain ? '#8B5CF6' : (activeBooster === 'bench' && isBench) ? '#10B981' : clubMeta?.color ?? '#fff'}`,
                background: clubMeta?.bg ?? 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 800, color: clubMeta?.color ?? '#fff',
                margin: '0 auto 4px',
                overflow: 'hidden',
                boxShadow: isCaptain
                  ? '0 0 14px rgba(212,175,55,0.7)'
                  : isViceCaptain
                  ? '0 0 14px rgba(139,92,246,0.7)'
                  : (activeBooster === 'bench' && isBench)
                  ? '0 0 12px rgba(16,185,129,0.6)'
                  : '0 4px 12px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(6px)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              {player.headshot_url && !headshotFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cleanCloudinaryUrl(player.headshot_url)!}
                  alt={player.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
                  onError={() => setFailedHeadshotUrl(player.headshot_url || null)}
                />
              ) : (
                player.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              )}
            </div>

            {/* Player Info Box */}
            <div style={{
              background: 'rgba(3, 8, 6, 0.9)',
              border: `1px solid ${isCaptain ? 'rgba(212,175,55,0.6)' : isViceCaptain ? 'rgba(139,92,246,0.6)' : activeBooster === 'bench' && isBench ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.14)'}`,
              borderRadius: '6px',
              padding: '2px 4px',
              backdropFilter: 'blur(6px)',
            }}>
              <div style={{
                fontSize: 'clamp(8.5px, 1.7vw, 10px)', fontWeight: 800, color: '#FFFFFF',
                lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', maxWidth: '76px', margin: '0 auto',
              }}>
                {player.name.split(' ').slice(-1)[0]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', alignItems: 'center', marginTop: '1px' }}>
                <ClubLogo
                  clubName={player.club}
                  logoUrl={player.clubs?.logo_url || player.club_logo_url}
                  size={11}
                  showBorder={false}
                />
                <span style={{ fontSize: '7.5px', color: clubMeta?.color, fontWeight: 800 }}>{clubMeta?.abbr}</span>
                <span style={{ fontSize: '7.5px', color: 'var(--gold)', fontWeight: 700 }}>{formatCost(player.cost)}</span>
              </div>
            </div>

            {/* Jersey Number Tag */}
            {!isBench && !isInjured && !isSuspended && (
              <div style={{
                position: 'absolute', top: '-3px', left: '-3px',
                width: '16px', height: '16px', borderRadius: '3px',
                background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '8.5px', fontWeight: 900, color: '#F8FAFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {slot.jersey}
              </div>
            )}
          </div>
        ) : (
          // Empty Slot
          <div style={{ textAlign: 'center', position: 'relative', width: 'clamp(58px, 10.5vw, 78px)' }}>
            <div style={{
              position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)',
              width: '16px', height: '16px', borderRadius: '3px',
              background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '8.5px', fontWeight: 900, color: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {slot.jersey}
            </div>
            <button
              type="button"
              onClick={onAdd}
              style={{
                width: 'clamp(46px, 8.8vw, 58px)',
                height: 'clamp(46px, 8.8vw, 58px)',
                borderRadius: '50%',
                border: '2px dashed rgba(255,255,255,0.3)',
                background: 'rgba(0,0,0,0.3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '4px auto 3px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--gold)';
                el.style.background = 'rgba(212,175,55,0.15)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(255,255,255,0.3)';
                el.style.background = 'rgba(0,0,0,0.3)';
              }}
            >
              <Plus size={18} color="rgba(255,255,255,0.6)" />
            </button>
            <div style={{
              fontSize: 'clamp(7.5px, 1.5vw, 9px)', color: 'rgba(255,255,255,0.7)', fontWeight: 800,
              background: 'rgba(0,0,0,0.55)', padding: '1px 4px', borderRadius: '3px',
              display: 'inline-block',
            }}>
              {slot.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Pitch View Component with Starting XV Pitch & Substitutes Bench
// ─────────────────────────────────────────────────────────────────────────────
export function PitchView({ onAddPlayer }: { onAddPlayer?: (jersey: number, position: string) => void }) {
  const {
    squad,
    captainId,
    viceCaptainId,
    removePlayer,
    setCaptain,
    setViceCaptain,
    activeBooster,
    setActiveBooster,
    swapPlayers,
  } = useSquadStore();
  const { players } = usePlayersStore();

  // Selected player for action modal
  const [selectedPlayerForAction, setSelectedPlayerForAction] = useState<{
    player: Player;
    slotJersey: number;
    slotPosition: string;
    tab?: 'roles' | 'swap';
  } | null>(null);

  const [boosterToast, setBoosterToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Directly map all 23 slots (1–15 Starters, 16–23 Reserves) to the squad player
  const squadMap = new Map<number, Player>();
  [...FORMATION, ...BENCH_FORMATION].forEach(slot => {
    const sp = squad.find(s => s.pitchSlot === slot.jersey);
    if (sp && sp.player) {
      const livePlayer = players.find(
        p => p.id === sp.player.id || p.name.toLowerCase() === sp.player.name?.toLowerCase()
      ) || sp.player;
      squadMap.set(slot.jersey, livePlayer);
    }
  });

  const activeBoosterObj = BOOSTERS.find(b => isBoosterActive(b.id, activeBooster));
  const isBenchBoostActive = isBoosterActive('BENCH_BOOST', activeBooster);

  const handleBoosterClick = (id: string, used: boolean) => {
    const target = (id === 'BENCH_BOOST' ? 'BENCH_BOOST' : id) as BoosterType;
    const result = setActiveBooster(used ? null : target);
    if (!result.isValid && result.errors.length > 0) {
      setBoosterToast({ message: result.errors[0], type: 'error' });
      setTimeout(() => setBoosterToast(null), 5000);
    } else if (!used) {
      const bObj = BOOSTERS.find(b => b.id === id);
      setBoosterToast({ message: `✓ ${bObj?.label || id} chip activated!`, type: 'success' });
      setTimeout(() => setBoosterToast(null), 3000);
    } else {
      setBoosterToast(null);
    }
  };

  const benchFilledCount = BENCH_FORMATION.filter(slot => squadMap.has(slot.jersey)).length;
  const startersFilledCount = FORMATION.filter(slot => squadMap.has(slot.jersey)).length;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Boosters Row / HUD (Position relative, zIndex 50, pointerEvents auto) ── */}
      <div className="boosters-container" style={{
        position: 'relative',
        zIndex: 50,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '10px',
        padding: '10px 14px',
        background: 'rgba(10, 18, 14, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Tactical Boosters:
          </span>
          {activeBoosterObj ? (
            <span style={{
              fontSize: '10.5px', fontWeight: 800, color: activeBoosterObj.color,
              background: activeBoosterObj.bg, padding: '3px 9px', borderRadius: '6px',
              border: `1px solid ${activeBoosterObj.color}66`,
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              ● {activeBoosterObj.label} Active
            </span>
          ) : (
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              (Tap a chip to apply)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {BOOSTERS.map(({ id, icon: Icon, label, short, color, bg }) => {
            const used = isBoosterActive(id, activeBooster);
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleBoosterClick(id, used)}
                title={label}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '8px',
                  border: `1.5px solid ${used ? color : `${color}44`}`,
                  background: used ? bg : 'rgba(5, 12, 10, 0.85)',
                  cursor: 'pointer', backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  boxShadow: used ? `0 0 14px ${color}66` : 'none',
                  pointerEvents: 'auto',
                }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: used ? color : 'rgba(255,255,255,0.9)', letterSpacing: '0.04em' }}>
                  {short}
                </span>
                {used && (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: color, boxShadow: `0 0 6px ${color}`,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Booster Feedback / Alert Toast Banner */}
      {boosterToast && (
        <div style={{
          marginBottom: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: boosterToast.type === 'error' ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.18)',
          border: `1.5px solid ${boosterToast.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
          color: boosterToast.type === 'error' ? '#FCA5A5' : '#6EE7B7',
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        }}>
          {boosterToast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{boosterToast.message}</span>
        </div>
      )}

      {/* ── 3D Spacious Pitch Container (Centered in Viewport) ── */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        padding: '6px 0 12px',
      }}>

        {/* ── Pitch Header Info ── */}
        <div style={{
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          marginBottom: '8px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🏉 Starting XV (Jerseys 1–15)
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: startersFilledCount === 15 ? '#34D399' : 'var(--gold)' }}>
            {startersFilledCount}/15 Starters Selected
          </span>
        </div>

        {/* ── Pitch Plane: Symmetrical Center X-Rotation ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          minHeight: '880px',
          borderRadius: '24px',
          overflow: 'hidden',
          margin: '0 auto',
          transform: 'perspective(1200px) rotateX(26deg)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          boxShadow: '0 30px 60px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(16, 185, 129, 0.12)',
          border: '2.5px solid rgba(255, 255, 255, 0.16)',
          background: `
            linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 15%, rgba(0,0,0,0) 85%, rgba(0,0,0,0.25) 100%),
            repeating-linear-gradient(
              180deg,
              #0c4819 0px,
              #0c4819 54px,
              #0e531f 54px,
              #0e531f 108px
            )
          `,
          padding: '36px 10px 32px',
        }}>

          {/* Symmetrical SVG Rugby Pitch Markings */}
          <RugbyPitchMarkingsSVG />

          {/* Centered H-Shaped Rugby Posts */}
          <RugbyGoalPosts isTop={true} />
          <RugbyGoalPosts isTop={false} />

          {/* ── 15-Player Formation Grid (Generous 126px+ Row Height) ─────────── */}
          <div className="pitch-formation-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'clamp(122px, 14.5vw, 138px)',
            rowGap: '6px',
            position: 'relative',
            zIndex: 25,
            padding: '32px 4px 20px',
            transformStyle: 'preserve-3d',
          }}>
            {FORMATION.map(slot => {
              const player = squadMap.get(slot.jersey) ?? null;
              return (
                <PitchSlot
                  key={slot.jersey}
                  slot={slot}
                  player={player}
                  isCaptain={!!(player && captainId === String(player.id))}
                  isViceCaptain={!!(player && viceCaptainId === String(player.id))}
                  activeBooster={activeBooster}
                  onAdd={() => onAddPlayer?.(slot.jersey, slot.position)}
                  onSelectForAction={p => setSelectedPlayerForAction({
                    player: p,
                    slotJersey: slot.jersey,
                    slotPosition: slot.position,
                    tab: 'roles',
                  })}
                />
              );
            })}
          </div>

          {/* Touchline Identifiers */}
          <div style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center',
            fontSize: '8.5px', fontWeight: 900, color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.2em', whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            ◄ ATTACKING 22m
          </div>
          <div style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'center',
            fontSize: '8.5px', fontWeight: 900, color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.2em', whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            DEFENSIVE 22m ►
          </div>
        </div>
      </div>

      {/* ── SUBSTITUTES BENCH (8 RESERVES) ─────────────────────────────────── */}
      <div style={{
        marginTop: '16px',
        background: 'linear-gradient(180deg, rgba(14, 26, 18, 0.95) 0%, rgba(8, 15, 10, 0.98) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '18px',
        padding: '18px 20px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}>
        {/* Bench Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Users size={18} color="#10B981" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="font-condensed" style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', margin: 0, letterSpacing: '0.04em' }}>
                  SUBSTITUTES BENCH
                </h3>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '1px 6px',
                  borderRadius: '5px',
                  color: '#CBD5E1',
                }}>
                  Jerseys 16–23 ({benchFilledCount}/8)
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.6)', margin: '2px 0 0' }}>
                Tactical replacements · Tap any reserve card or &apos;Swap ⇄&apos; to swap with a starter
              </p>
            </div>
          </div>

          {/* Right status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isBenchBoostActive ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1.5px solid #10B981',
                color: '#34D399',
                fontSize: '11px',
                fontWeight: 800,
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.35)',
              }}>
                <Repeat size={14} />
                <span>⚡ BENCH BOOST ACTIVE · All 8 Reserves Score!</span>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                <span>Standard GW: 0 Pts unless Bench Boost is active</span>
              </div>
            )}
          </div>
        </div>

        {/* Bench Grid (8 Slots) */}
        <div className="bench-grid">
          {BENCH_FORMATION.map(slot => {
            const player = squadMap.get(slot.jersey) ?? null;
            return (
              <BenchSlotCard
                key={slot.jersey}
                slot={slot}
                player={player}
                isCaptain={!!(player && captainId === String(player.id))}
                isViceCaptain={!!(player && viceCaptainId === String(player.id))}
                activeBooster={activeBooster}
                onAdd={() => onAddPlayer?.(slot.jersey, slot.position)}
                onSelectForAction={p => setSelectedPlayerForAction({
                  player: p,
                  slotJersey: slot.jersey,
                  slotPosition: slot.position,
                  tab: 'roles',
                })}
                onQuickSwap={p => setSelectedPlayerForAction({
                  player: p,
                  slotJersey: slot.jersey,
                  slotPosition: slot.position,
                  tab: 'swap',
                })}
              />
            );
          })}
        </div>
      </div>

      {/* ── Player Action Modal (Un-skewed, Touch-Friendly, Large Buttons) ── */}
      {selectedPlayerForAction && (
        <PlayerActionModal
          player={selectedPlayerForAction.player}
          slotJersey={selectedPlayerForAction.slotJersey}
          slotPosition={selectedPlayerForAction.slotPosition}
          isCaptain={captainId === String(selectedPlayerForAction.player.id)}
          isViceCaptain={viceCaptainId === String(selectedPlayerForAction.player.id)}
          activeBooster={activeBooster}
          allSquad={squad}
          initialTab={selectedPlayerForAction.tab || 'roles'}
          onClose={() => setSelectedPlayerForAction(null)}
          onSetCaptain={p => setCaptain(p.id)}
          onSetViceCaptain={p => setViceCaptain(p.id)}
          onRemove={p => removePlayer(p.id)}
          onSwap={(fromId, toId) => {
            const res = swapPlayers(fromId, toId);
            if (res.success) {
              setBoosterToast({ message: '✓ Tactical player swap completed successfully!', type: 'success' });
              setTimeout(() => setBoosterToast(null), 3500);
            }
            return res;
          }}
        />
      )}

      <style>{`
        .bench-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 10px;
        }
        @media (max-width: 900px) {
          .bench-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
        }
        @media (max-width: 500px) {
          .bench-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
        }
        @media (max-width: 640px) {
          .pitch-formation-grid {
            grid-auto-rows: clamp(98px, 13vh, 114px) !important;
            padding: 20px 0 10px !important;
            row-gap: 4px !important;
          }
          .boosters-container {
            justify-content: center !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
