'use client';
import { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle, Plus, Check, Shield, Crown, Zap, Users, Repeat } from 'lucide-react';
import { useSquadStore } from '@/store/squadStore';
import { MOCK_PLAYERS, CLUB_META } from '@/lib/mockData';
import { SQUAD_RULES, formatCost, BOOSTERS_LIST } from '@/lib/fantasyRules';
import { PitchView } from './PitchView';

// ─────────────────────────────────────────────────────────────────────────────
// Budget Bar
// ─────────────────────────────────────────────────────────────────────────────
function BudgetBar() {
  const { getRemainingBudget, getSpentBudget, squad, activeBooster } = useSquadStore();
  const remaining = getRemainingBudget();
  const spent = getSpentBudget();
  const pct = Math.min((spent / SQUAD_RULES.TOTAL_BUDGET) * 100, 100);
  const danger = remaining < 5_000_000 && activeBooster !== 'limit';

  return (
    <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Budget Remaining
          </div>
          <div className="font-condensed" style={{ fontSize: '28px', fontWeight: 800, color: danger ? 'var(--danger)' : 'var(--neon)', lineHeight: 1 }}>
            {activeBooster === 'limit' ? (
              <span style={{ color: '#A855F7' }}>∞ LIMITLESS</span>
            ) : (
              formatCost(remaining)
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Players</div>
          <div className="font-condensed" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {squad.length}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/15</span>
          </div>
        </div>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{
          width: activeBooster === 'limit' ? '100%' : `${pct}%`,
          background: activeBooster === 'limit'
            ? 'linear-gradient(90deg, #A855F7, #EC4899)'
            : danger
            ? 'linear-gradient(90deg, #991B1B, #EF4444)'
            : 'linear-gradient(90deg, #166534, #22C55E)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>{formatCost(spent)} spent</span>
        <span>{activeBooster === 'limit' ? 'No salary cap' : `Budget: ${formatCost(SQUAD_RULES.TOTAL_BUDGET)}`}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player Picker Panel
// ─────────────────────────────────────────────────────────────────────────────
function PlayerPicker({ position, jersey, onClose }: { position: string | null; jersey: number | null; onClose: () => void }) {
  const { addPlayer, getClubCount, squad, activeBooster } = useSquadStore();
  const [search, setSearch] = useState('');

  // Strict string ID set to prevent ghost matches or duplicate adds
  const squadIds = new Set(squad.map(sp => String(sp.playerId)));

  const filtered = MOCK_PLAYERS.filter(p =>
    (!position || p.position === position) &&
    !squadIds.has(String(p.id)) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-light)',
      borderRadius: '14px', overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>
          Pick {position ?? 'Player'}
        </h3>
        <button onClick={onClose} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>✕ Close</button>
      </div>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <input
          className="input"
          placeholder="Search by name or club..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No eligible players found
          </div>
        )}
        {filtered.map(p => {
          const clubMeta = CLUB_META[p.club] ?? { bg: 'rgba(255,255,255,0.1)', color: '#fff', abbr: p.club.slice(0, 3).toUpperCase() };
          const clubFull = getClubCount(p.club) >= SQUAD_RULES.MAX_PER_CLUB;
          const matchStatus = p.matchStatus || (p.isInjured ? 'injured' : p.isSuspended ? 'suspended' : 'starting');

          return (
            <button key={p.id}
              disabled={clubFull}
              onClick={() => {
                addPlayer({ ...p, cost: Number(p.cost) || 0 }, jersey ?? undefined);
                onClose();
              }}
              style={{
                width: '100%', padding: '12px 20px',
                background: 'transparent', border: 'none',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '12px',
                cursor: clubFull ? 'not-allowed' : 'pointer',
                opacity: clubFull ? 0.5 : 1,
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => !clubFull && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: clubMeta.bg, border: `2px solid ${clubMeta.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: clubMeta.color, flexShrink: 0,
              }}>
                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '1px 4px', borderRadius: '3px' }}>
                    {clubMeta.abbr}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.position}</span>
                  <span className="badge badge-gold" style={{ fontSize: '9px', padding: '1px 5px' }}>{p.tier}</span>

                  {/* Match status pill */}
                  {matchStatus === 'injured' && (
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#EF4444', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '1px 5px', borderRadius: '4px' }}>
                      🤕 Injured
                    </span>
                  )}
                  {matchStatus === 'suspended' && (
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '1px 5px', borderRadius: '4px' }}>
                      🟨 Suspended
                    </span>
                  )}
                  {matchStatus === 'bench' && (
                    <span style={{
                      fontSize: '9px', fontWeight: 800,
                      color: activeBooster === 'bench' ? '#10B981' : '#60A5FA',
                      background: activeBooster === 'bench' ? 'rgba(16,185,129,0.2)' : 'rgba(96,165,250,0.15)',
                      border: `1px solid ${activeBooster === 'bench' ? 'rgba(16,185,129,0.5)' : 'rgba(96,165,250,0.3)'}`,
                      padding: '1px 5px', borderRadius: '4px',
                    }}>
                      {activeBooster === 'bench' ? '⭐ BB +50%' : '🔄 Bench'}
                    </span>
                  )}
                  {matchStatus === 'starting' && (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                      🟢 Starting
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>{formatCost(Number(p.cost))}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Form: {p.form.toFixed(1)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Squad Builder Page
// ─────────────────────────────────────────────────────────────────────────────
export function SquadBuilderPage() {
  const { squad, captainId, validateSquad, validateForSave, resetSquad, activeBooster, setActiveBooster } = useSquadStore();
  const [pickerPosition, setPickerPosition] = useState<{ position: string | null; jersey: number | null }>({ position: null, jersey: null });
  const [showPicker, setShowPicker] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const baseValidation = validateSquad();
  const activeBoosterObj = BOOSTERS_LIST.find(b => b.id === activeBooster);

  const handleSaveSquad = () => {
    setSaveError(null);
    const saveCheck = validateForSave();
    if (!saveCheck.isValid) {
      setSaveError(saveCheck.errors[0] || 'Unable to save squad.');
      return;
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="font-condensed" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            My Squad
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Season 26/27 · Round 4 · Build your tactical XV</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {squad.length > 0 && (
            <button onClick={resetSquad} className="btn btn-danger" style={{ fontSize: '13px' }}>
              <Trash2 size={14} /> Reset Squad
            </button>
          )}
        </div>
      </div>

      <div className="squad-builder-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* ── Pitch ──────────────────────────────────────────────────────── */}
        <div>
          {/* Active Booster Announcement Banner */}
          {activeBoosterObj && (
            <div style={{
              padding: '12px 16px', marginBottom: '14px',
              borderRadius: '10px',
              background: activeBoosterObj.bg,
              border: `1.5px solid ${activeBoosterObj.color}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: `0 4px 16px ${activeBoosterObj.color}22`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>
                  {activeBooster === 'triple' ? '👑' : activeBooster === 'limit' ? '⚡' : activeBooster === 'co' ? '👥' : '🔄'}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: activeBoosterObj.color }}>
                    {activeBoosterObj.label} Chip Active for Round 4
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>
                    {activeBoosterObj.description}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveBooster(null)}
                style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700,
                  color: '#FFF', cursor: 'pointer',
                }}
              >
                ✕ Cancel Chip
              </button>
            </div>
          )}

          {/* Validation banner — does NOT prematurely demand captaincy while adding players */}
          {squad.length > 0 && (
            <div style={{
              padding: '12px 16px', marginBottom: '16px',
              borderRadius: '10px',
              background: baseValidation.isValid ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${baseValidation.isValid ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.3)'}`,
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              {baseValidation.isValid
                ? <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                : <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              }
              <div style={{ fontSize: '13px', flex: 1 }}>
                {baseValidation.isValid ? (
                  squad.length === 15 ? (
                    captainId ? (
                      <span style={{ color: '#34D399', fontWeight: 600 }}>
                        All 15 positions filled and Captain designated. Ready to save!
                      </span>
                    ) : (
                      <span style={{ color: '#FCD34D', fontWeight: 600 }}>
                        15 players selected! Designate a Captain (C) before saving.
                      </span>
                    )
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Squad building in progress · {15 - squad.length} more player(s) required.
                    </span>
                  )
                ) : (
                  baseValidation.errors.map((e, i) => (
                    <div key={i} style={{ color: '#FCA5A5', fontWeight: 500 }}>{e}</div>
                  ))
                )}
                {baseValidation.warnings.map((w, i) => (
                  <div key={i} style={{ color: 'var(--warning)', fontWeight: 500, marginTop: '2px' }}>{w}</div>
                ))}
              </div>
            </div>
          )}

          {/* Save Squad Feedback Toast / Banner */}
          {saveSuccess && (
            <div style={{
              padding: '12px 16px', marginBottom: '16px',
              borderRadius: '10px', background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.4)',
              display: 'flex', alignItems: 'center', gap: '10px', color: '#34D399', fontSize: '13px', fontWeight: 700,
            }}>
              <Check size={18} /> Squad successfully locked in and saved for Round 4!
              {activeBoosterObj && (
                <span style={{ color: activeBoosterObj.color, fontWeight: 800 }}>
                  ({activeBoosterObj.label} boost applied)
                </span>
              )}
            </div>
          )}

          {saveError && (
            <div style={{
              padding: '12px 16px', marginBottom: '16px',
              borderRadius: '10px', background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              display: 'flex', alignItems: 'center', gap: '10px', color: '#FCA5A5', fontSize: '13px', fontWeight: 600,
            }}>
              <AlertCircle size={18} /> {saveError}
            </div>
          )}

          {/* 3D Rugby Pitch */}
          <PitchView
            onAddPlayer={(jersey, position) => {
              setPickerPosition({ jersey, position });
              setShowPicker(true);
            }}
          />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <BudgetBar />

          {/* Add player shortcut */}
          {!showPicker && (
            <button
              onClick={() => { setPickerPosition({ position: null, jersey: null }); setShowPicker(true); }}
              className="btn btn-gold"
              style={{ width: '100%', padding: '14px' }}
            >
              <Plus size={16} /> Add Player
            </button>
          )}

          {/* Player picker */}
          {showPicker && (
            <PlayerPicker
              position={pickerPosition.position}
              jersey={pickerPosition.jersey}
              onClose={() => { setShowPicker(false); setPickerPosition({ position: null, jersey: null }); }}
            />
          )}

          {/* ── Round Boosters Selection Card ── */}
          <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Round 4 Boosters
              </h3>
              {activeBooster && (
                <button
                  type="button"
                  onClick={() => setActiveBooster(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--danger)', fontSize: '11px', fontWeight: 700,
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              Select a boost chip to apply for this round before saving:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {BOOSTERS_LIST.map(b => {
                const isSelected = activeBooster === b.id;
                const Icon = b.id === 'triple' ? Crown : b.id === 'limit' ? Zap : b.id === 'co' ? Users : Repeat;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBooster(isSelected ? null : b.id)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? b.color : 'rgba(255,255,255,0.08)'}`,
                      background: isSelected ? b.bg : 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 0 14px ${b.color}40` : 'none',
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: isSelected ? b.color : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={14} color={isSelected ? '#000' : b.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? b.color : 'var(--text-primary)' }}>
                          {b.label}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: b.color, background: 'rgba(0,0,0,0.4)', padding: '1px 5px', borderRadius: '4px' }}>
                          {b.short}
                        </span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
                        {b.description}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {isSelected ? (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: b.color }}>
                          ✓ Active
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Apply
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position requirements */}
          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Position Requirements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(SQUAD_RULES.POSITION_LIMITS).map(([pos, limit]) => {
                const count = squad.filter(sp => sp.player?.position === pos).length;
                return (
                  <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{pos}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{limit.min}–{limit.max}</span>
                      <span style={{
                        fontSize: '12px', fontWeight: 700,
                        color: count >= limit.min ? 'var(--success)' : count > 0 ? 'var(--warning)' : 'var(--text-muted)',
                      }}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Squad Button: Captain validation is enforced on click */}
          <button
            onClick={handleSaveSquad}
            className="btn btn-gold"
            disabled={squad.length < 15 || !baseValidation.isValid}
            style={{
              width: '100%', padding: '14px',
              opacity: (squad.length < 15 || !baseValidation.isValid) ? 0.5 : 1,
              cursor: (squad.length < 15 || !baseValidation.isValid) ? 'not-allowed' : 'pointer',
            }}
          >
            <Shield size={16} /> Save Squad (Round 4)
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .squad-builder-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
