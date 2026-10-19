'use client';
import { useState } from 'react';
import { Save, RefreshCw, Check } from 'lucide-react';
import { MOCK_FIXTURES, MOCK_PLAYERS, CLUB_META } from '@/lib/mockData';
import { calculatePoints } from '@/lib/fantasyRules';
import { Fixture, Player } from '@/types/fantasy';

const EMPTY_STATS = {
  minutesPlayed: 80, tries: 0, tryAssists: 0, conversions: 0,
  penaltyGoals: 0, dropGoals: 0, tackles: 0, carries: 0,
  lineoutsWon: 0, lineoutsLost: 0, scrumWon: 0, scrumLost: 0,
  yellowCards: 0, redCards: 0,
};

type StatKey = keyof typeof EMPTY_STATS;

const STAT_FIELDS: { key: StatKey; label: string; desc: string }[] = [
  { key: 'minutesPlayed', label: 'Minutes Played', desc: '60+ = 2pts, 30–59 = 1pt' },
  { key: 'tries',         label: 'Tries',           desc: '5pts each' },
  { key: 'tryAssists',    label: 'Try Assists',     desc: '3pts each' },
  { key: 'conversions',   label: 'Conversions',     desc: '2pts each' },
  { key: 'penaltyGoals',  label: 'Penalty Goals',   desc: '3pts each' },
  { key: 'dropGoals',     label: 'Drop Goals',      desc: '3pts each' },
  { key: 'tackles',       label: 'Tackles',         desc: '0.5pts each' },
  { key: 'carries',       label: 'Carries',         desc: '0.5pts each' },
  { key: 'lineoutsWon',   label: 'Lineouts Won',    desc: '+1pt each' },
  { key: 'lineoutsLost',  label: 'Lineouts Lost',   desc: '-1pt each' },
  { key: 'scrumWon',      label: 'Scrums Won',      desc: '+1pt each' },
  { key: 'scrumLost',     label: 'Scrums Lost',     desc: '-1pt each' },
  { key: 'yellowCards',   label: 'Yellow Cards',    desc: '-3pts each' },
  { key: 'redCards',      label: 'Red Cards',       desc: '-5pts each' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Stat Overrides / Tisini Entry (View C)
// ─────────────────────────────────────────────────────────────────────────────
export function StatOverrides() {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState({ ...EMPTY_STATS });
  const [saved, setSaved] = useState(false);
  const [savedEntries, setSavedEntries] = useState<{ player: Player; pts: number; fixtureId: string }[]>([]);

  const availablePlayers = selectedFixture
    ? MOCK_PLAYERS.filter(p => p.club === selectedFixture.homeClub || p.club === selectedFixture.awayClub)
    : [];

  const previewPoints = calculatePoints({
    playerId: selectedPlayer?.id ?? '',
    gameweek: 4,
    ...stats,
    points: 0,
  }, false);

  const handleSave = () => {
    if (!selectedFixture || !selectedPlayer) return;

    // In production:
    // await supabase.from('match_events').upsert({
    //   playerId: selectedPlayer.id,
    //   fixtureId: selectedFixture.id,
    //   gameweek: 4,
    //   ...stats,
    //   enteredByAdminId: currentAdminId,
    // })
    // Then trigger recalculation: UPDATE player_stats SET points = ... WHERE playerId = ...

    setSavedEntries(prev => {
      const exists = prev.findIndex(e => e.player.id === selectedPlayer.id && e.fixtureId === selectedFixture.id);
      const entry = { player: selectedPlayer, pts: previewPoints, fixtureId: selectedFixture.id };
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = entry;
        return next;
      }
      return [entry, ...prev];
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setStats({ ...EMPTY_STATS });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

      {/* ── Left: Selection + Form ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Step 1: Select Match */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Step 1 — Select Match
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MOCK_FIXTURES.map(f => {
              const homeMeta = CLUB_META[f.homeClub];
              const awayMeta = CLUB_META[f.awayClub];
              const active = selectedFixture?.id === f.id;
              return (
                <button key={f.id} onClick={() => { setSelectedFixture(f); setSelectedPlayer(null); setStats({ ...EMPTY_STATS }); }}
                  style={{
                    padding: '10px 14px', borderRadius: '8px', border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                    background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: homeMeta.color, background: homeMeta.bg, padding: '2px 5px', borderRadius: '4px' }}>{homeMeta.abbr}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>vs</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: awayMeta.color, background: awayMeta.bg, padding: '2px 5px', borderRadius: '4px' }}>{awayMeta.abbr}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date(f.kickoffTime).toLocaleDateString('en-KE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Player */}
        {selectedFixture && (
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Step 2 — Select Player
            </h3>
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {availablePlayers.map(p => {
                const cm = CLUB_META[p.club];
                const active = selectedPlayer?.id === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPlayer(p)}
                    style={{
                      padding: '8px 12px', borderRadius: '7px',
                      border: `1px solid ${active ? 'var(--gold)' : 'transparent'}`,
                      background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                    }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: cm.color, background: cm.bg, padding: '1px 5px', borderRadius: '3px' }}>{cm.abbr}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: active ? 700 : 400 }}>{p.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{p.position}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Enter stats */}
        {selectedPlayer && (
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Step 3 — Enter Stats
              </h3>
              <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={11} /> Reset
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {STAT_FIELDS.map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                  <input
                    type="number" min={0} max={key === 'minutesPlayed' ? 100 : 30}
                    value={stats[key]}
                    onChange={e => setStats(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    style={{
                      width: '64px', padding: '6px 10px', borderRadius: '6px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700,
                      textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="btn btn-gold" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
              {saved ? <><Check size={14} /> Saved to match_events!</> : <><Save size={14} /> Save Override</>}
            </button>
          </div>
        )}
      </div>

      {/* ── Right: Preview + Saved Entries ─────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Live points preview */}
        {selectedPlayer && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(57,255,20,0.06))',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '14px', padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Calculated Points Preview
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {selectedPlayer.name}
            </div>
            <div className="font-condensed" style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1, color: 'var(--gold)' }}>
              {previewPoints}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>fantasy points (×2 if captain)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
              {[
                { label: 'Tries', val: stats.tries, pts: stats.tries * 5 },
                { label: 'Assists', val: stats.tryAssists, pts: stats.tryAssists * 3 },
                { label: 'Kicks', val: stats.penaltyGoals + stats.conversions, pts: stats.penaltyGoals * 3 + stats.conversions * 2 },
              ].map(({ label, val, pts }) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: pts > 0 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 700 }}>{pts > 0 ? `+${pts}` : '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved entries log */}
        {savedEntries.length > 0 && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Saved Override Log</h3>
            </div>
            {savedEntries.map(({ player, pts }, idx) => {
              const cm = CLUB_META[player.club];
              return (
                <div key={`${player.id}-${idx}`} style={{
                  padding: '12px 16px', borderBottom: idx < savedEntries.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: cm.bg, border: `2px solid ${cm.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: cm.color, flexShrink: 0 }}>
                    {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{player.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{player.position}</div>
                  </div>
                  <div className="font-condensed" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)' }}>{pts}pts</div>
                  <span className="badge badge-green" style={{ fontSize: '9px' }}>SAVED</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#93C5FD' }}>
          💡 <strong>Production:</strong> &quot;Save Override&quot; writes to <code>match_events</code> table then recalculates <code>player_stats.points</code> via a Supabase Edge Function or DB trigger.
        </div>
      </div>
    </div>
  );
}
