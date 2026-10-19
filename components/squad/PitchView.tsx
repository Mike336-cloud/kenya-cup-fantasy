'use client';
import { useState } from 'react';
import { Plus, X, Crown, Star, Zap, Users, Repeat } from 'lucide-react';
import { useSquadStore } from '@/store/squadStore';
import { CLUB_META } from '@/lib/mockData';
import { formatCost } from '@/lib/fantasyRules';
import { Player } from '@/types/fantasy';

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
  row: number;
  col: number;
  span: number;
}[] = [
  // Front Row (Row 1) — LH Prop (1), Hooker (2), TH Prop (3)
  { jersey: 1, label: 'LH Prop',    position: 'Prop',      row: 1, col: 2, span: 2 },
  { jersey: 2, label: 'Hooker',     position: 'Hooker',    row: 1, col: 6, span: 2 },
  { jersey: 3, label: 'TH Prop',    position: 'Prop',      row: 1, col: 10, span: 2 },

  // Second Row (Row 2) — Locks (4, 5)
  { jersey: 4, label: 'Lock',       position: 'Lock',      row: 2, col: 4, span: 2 },
  { jersey: 5, label: 'Lock',       position: 'Lock',      row: 2, col: 8, span: 2 },

  // Back Row (Row 3) — Flanker (6), Number 8 (8), Flanker (7)
  { jersey: 6, label: 'Flanker',    position: 'Flanker',   row: 3, col: 2, span: 2 },
  { jersey: 8, label: 'Number 8',   position: 'Number 8',  row: 3, col: 6, span: 2 },
  { jersey: 7, label: 'Flanker',    position: 'Flanker',   row: 3, col: 10, span: 2 },

  // Half-backs (Row 4) — Scrum-half (9), Fly-half (10)
  { jersey: 9, label: 'Scrum-half', position: 'Scrum-half',row: 4, col: 4, span: 2 },
  { jersey: 10,label: 'Fly-half',   position: 'Fly-half',  row: 4, col: 8, span: 2 },

  // Centers (Row 5) — Inside Ctr (12), Outside Ctr (13)
  { jersey: 12,label: 'Inside Ctr', position: 'Center',    row: 5, col: 4, span: 2 },
  { jersey: 13,label: 'Outside Ctr',position:'Center',     row: 5, col: 8, span: 2 },

  // Back Three (Row 6) — L Wing (11), Full-back (15), R Wing (14)
  { jersey: 11,label: 'L Wing',     position: 'Wing',      row: 6, col: 2, span: 2 },
  { jersey: 15,label: 'Full-back',  position: 'Full-back', row: 6, col: 6, span: 2 },
  { jersey: 14,label: 'R Wing',     position: 'Wing',      row: 6, col: 10, span: 2 },
];

const BOOSTERS = [
  { id: 'triple', icon: Crown,   label: 'Triple Captain',  short: '3×C',  color: '#F59E0B', bg: 'rgba(245,158,11,0.2)' },
  { id: 'limit',  icon: Zap,     label: 'Limitless',       short: 'LIM',  color: '#A855F7', bg: 'rgba(168,85,247,0.2)' },
  { id: 'co',     icon: Users,   label: 'Co-Captains',     short: 'CO-C', color: '#3B82F6', bg: 'rgba(59,130,246,0.2)' },
  { id: 'bench',  icon: Repeat,  label: 'Bench Boost',     short: 'BB',   color: '#10B981', bg: 'rgba(16,185,129,0.2)' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3D H-Shaped Rugby Goalposts Component
// Positioned directly on the try line center (50% left) and counter-rotated upright
// ─────────────────────────────────────────────────────────────────────────────
function RugbyGoalPosts({ isTop }: { isTop: boolean }) {
  const topPos = isTop ? '6.8%' : '93.2%';

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
// PitchSlot Component
// Counter-rotates player upright and scales gracefully on mobile
// ─────────────────────────────────────────────────────────────────────────────
interface PitchSlotProps {
  slot: typeof FORMATION[0];
  player: Player | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  onAdd: () => void;
  onRemove: (player: Player) => void;
  onSetCaptain: (player: Player) => void;
  onSetViceCaptain: (player: Player) => void;
}

function PitchSlot({ slot, player, isCaptain, isViceCaptain, onAdd, onRemove, onSetCaptain, onSetViceCaptain }: PitchSlotProps) {
  const [showMenu, setShowMenu] = useState(false);
  const clubMeta = player ? (CLUB_META[player.club] ?? { bg: 'rgba(255,255,255,0.1)', color: '#fff', abbr: player.club.slice(0, 3).toUpperCase() }) : null;

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
          <div style={{ position: 'relative', textAlign: 'center', width: 'clamp(58px, 11vw, 80px)' }}>
            {/* Captain / VC Badge */}
            {(isCaptain || isViceCaptain) && (
              <div style={{
                position: 'absolute', top: '-6px', right: '-3px', zIndex: 30,
                width: '20px', height: '20px', borderRadius: '50%',
                background: isCaptain ? 'var(--gold)' : '#8B5CF6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 10px ${isCaptain ? 'rgba(212,175,55,0.8)' : 'rgba(139,92,246,0.8)'}`,
                fontSize: '9.5px', fontWeight: 900, color: '#000',
              }}>
                {isCaptain ? 'C' : 'V'}
              </div>
            )}

            {/* Avatar Circle */}
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                width: 'clamp(46px, 9vw, 60px)',
                height: 'clamp(46px, 9vw, 60px)',
                borderRadius: '50%',
                border: `2px solid ${isCaptain ? 'var(--gold)' : isViceCaptain ? '#8B5CF6' : clubMeta?.color ?? '#fff'}`,
                background: clubMeta?.bg ?? 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 800, color: clubMeta?.color ?? '#fff',
                cursor: 'pointer', margin: '0 auto 3px',
                boxShadow: isCaptain ? '0 0 12px rgba(212,175,55,0.6)' : '0 4px 12px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(6px)',
              }}
            >
              {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </button>

            {/* Player Info Box */}
            <div style={{
              background: 'rgba(3, 8, 6, 0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '5px',
              padding: '1px 3px',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                fontSize: 'clamp(8px, 1.6vw, 9.5px)', fontWeight: 800, color: '#FFFFFF',
                lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', maxWidth: '72px', margin: '0 auto',
              }}>
                {player.name.split(' ').slice(-1)[0]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', alignItems: 'center' }}>
                <span style={{ fontSize: '7.5px', color: clubMeta?.color, fontWeight: 800 }}>{clubMeta?.abbr}</span>
                <span style={{ fontSize: '7.5px', color: 'var(--gold)', fontWeight: 700 }}>{formatCost(player.cost)}</span>
              </div>
            </div>

            {/* Jersey Number Tag */}
            <div style={{
              position: 'absolute', top: '-3px', left: '-3px',
              width: '16px', height: '16px', borderRadius: '3px',
              background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '8.5px', fontWeight: 900, color: '#F8FAFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {slot.jersey}
            </div>

            {/* Dropdown Action Menu */}
            {showMenu && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                zIndex: 60, background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: '10px', padding: '6px', width: '140px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.7)', marginTop: '6px',
              }}>
                <button onClick={() => { onSetCaptain(player); setShowMenu(false); }} style={menuItemStyle}>
                  <Crown size={12} color="var(--gold)" /> Set Captain
                </button>
                <button onClick={() => { onSetViceCaptain(player); setShowMenu(false); }} style={menuItemStyle}>
                  <Star size={12} color="#8B5CF6" /> Set Vice-Captain
                </button>
                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                <button onClick={() => { onRemove(player); setShowMenu(false); }} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
                  <X size={12} /> Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty Slot
          <div style={{ textAlign: 'center', position: 'relative', width: 'clamp(54px, 10vw, 76px)' }}>
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
              onClick={onAdd}
              style={{
                width: 'clamp(44px, 8.5vw, 56px)',
                height: 'clamp(44px, 8.5vw, 56px)',
                borderRadius: '50%',
                border: '2px dashed rgba(255,255,255,0.25)',
                background: 'rgba(0,0,0,0.25)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '3px auto', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--gold)';
                el.style.background = 'rgba(212,175,55,0.12)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(255,255,255,0.25)';
                el.style.background = 'rgba(0,0,0,0.25)';
              }}
            >
              <Plus size={18} color="rgba(255,255,255,0.5)" />
            </button>
            <div style={{
              fontSize: 'clamp(7.5px, 1.5vw, 9px)', color: 'rgba(255,255,255,0.6)', fontWeight: 800,
              background: 'rgba(0,0,0,0.5)', padding: '1px 3px', borderRadius: '3px',
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

const menuItemStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
  padding: '7px 9px', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', borderRadius: '6px',
  textAlign: 'left', transition: 'background 0.15s',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Pitch View Component with Responsive Mobile-First Handling
// ─────────────────────────────────────────────────────────────────────────────
export function PitchView({ onAddPlayer }: { onAddPlayer?: (jersey: number, position: string) => void }) {
  const { squad, captainId, viceCaptainId, removePlayer, setCaptain, setViceCaptain } = useSquadStore();
  const [activeBooster, setActiveBooster] = useState<string | null>(null);

  // Directly map slot jersey to the squad player (100% reliable)
  const squadMap = new Map<number, Player>();
  FORMATION.forEach(slot => {
    const sp = squad.find(s => s.pitchSlot === slot.jersey);
    if (sp && sp.player) {
      squadMap.set(slot.jersey, sp.player);
    }
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '920px', margin: '0 auto' }}>

      {/* ── Boosters Row / HUD (Responsive: Top bar on mobile, pinned on desktop) ── */}
      <div className="boosters-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '6px', marginBottom: '8px', zIndex: 40,
      }}>
        <span style={{
          fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px',
        }}>
          Boosters:
        </span>
        {BOOSTERS.map(({ id, icon: Icon, label, short, color, bg }) => {
          const used = activeBooster === id;
          return (
            <button key={id} onClick={() => setActiveBooster(used ? null : id)}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 9px', borderRadius: '8px',
                border: `1px solid ${used ? color : `${color}44`}`,
                background: used ? bg : 'rgba(5, 12, 10, 0.65)',
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                boxShadow: used ? `0 0 12px ${color}55` : 'none',
              }}>
              <Icon size={13} color={color} />
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: used ? color : 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>
                {short}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3D Centered Pitch Container ───────────────────────────────────── */}
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '4px 0 24px',
      }}>

        {/* ── Pitch Plane: Directly applying perspective(1200px) rotateX(26deg) for true symmetry ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '620px',
          borderRadius: '20px',
          overflow: 'hidden',
          margin: '0 auto',
          transform: 'perspective(1200px) rotateX(26deg)',
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
          boxShadow: '0 30px 60px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.1)',
          border: '2.5px solid rgba(255, 255, 255, 0.15)',
          background: `
            linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 15%, rgba(0,0,0,0) 85%, rgba(0,0,0,0.25) 100%),
            repeating-linear-gradient(
              180deg,
              #0c4819 0px,
              #0c4819 44px,
              #0e531f 44px,
              #0e531f 88px
            )
          `,
          padding: '24px 8px',
        }}>

          {/* Symmetrical SVG Rugby Pitch Markings */}
          <RugbyPitchMarkingsSVG />

          {/* Centered H-Shaped Rugby Posts */}
          <RugbyGoalPosts isTop={true} />
          <RugbyGoalPosts isTop={false} />

          {/* ── 15-Player Formation Grid (12 Columns Symmetrical) ─────────── */}
          <div className="pitch-formation-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: '88px',
            position: 'relative',
            zIndex: 25,
            padding: '20px 4px 12px',
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
                  onAdd={() => onAddPlayer?.(slot.jersey, slot.position)}
                  onRemove={p => removePlayer(p.id)}
                  onSetCaptain={p => setCaptain(p.id)}
                  onSetViceCaptain={p => setViceCaptain(p.id)}
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

      <style>{`
        @media (max-width: 640px) {
          .pitch-formation-grid {
            grid-auto-rows: 72px !important;
            padding: 14px 0 8px !important;
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
