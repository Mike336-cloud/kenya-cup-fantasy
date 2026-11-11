'use client';
import { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, Shield, Zap, AlertTriangle, Sparkles, Award } from 'lucide-react';
import { MOCK_FIXTURES } from '@/lib/mockData';
import { usePlayersStore } from '@/lib/playerStore';
import { useClubsStore } from '@/lib/clubStore';
import { useFixtureStore } from '@/lib/fixtureStore';
import { ClubLogo } from '@/components/common/ClubLogo';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { calculatePoints, EMPTY_MATCH_EVENT_DATA, isForwardPosition } from '@/lib/fantasyRules';
import { Fixture, Player, MatchEventData } from '@/types/fantasy';

export function StatOverrides() {
  const { players } = usePlayersStore();
  const { getClubMeta } = useClubsStore();
  const { fixtures, fetchFixtures, activeRound } = useFixtureStore();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<MatchEventData>({ ...EMPTY_MATCH_EVENT_DATA });
  const [saved, setSaved] = useState(false);
  const [savedEntries, setSavedEntries] = useState<{ player: Player; pts: number; fixtureId: string }[]>([]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const matchFixtures = fixtures.length > 0 ? fixtures : MOCK_FIXTURES;

  const availablePlayers = selectedFixture
    ? players.filter(p => p.club === selectedFixture.homeClub || p.club === selectedFixture.awayClub)
    : [];

  const isForward = isForwardPosition(selectedPlayer?.position);

  const previewPoints = selectedPlayer
    ? calculatePoints(
        {
          playerId: selectedPlayer.id,
          gameweek: selectedFixture?.gameweek || activeRound || 1,
          ...stats,
          points: 0,
        },
        false,
        null,
        false,
        selectedPlayer.matchStatus,
        'STARTER',
        selectedPlayer.position
      )
    : 0;

  const handleSave = () => {
    if (!selectedFixture || !selectedPlayer) return;

    // In production, persists to match_events table via Supabase:
    // await supabase.from('match_events').upsert({
    //   playerId: selectedPlayer.id,
    //   fixtureId: selectedFixture.id,
    //   gameweek: selectedFixture.gameweek || activeRound || 1,
    //   ...stats,
    // });

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
    setStats({ ...EMPTY_MATCH_EVENT_DATA });
  };

  const updateStat = <K extends keyof MatchEventData>(key: K, value: MatchEventData[K]) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '20px', alignItems: 'start' }}>

      {/* ── Left: Selection + Form ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Step 1: Select Match */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Step 1 — Select Match
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {matchFixtures.map(f => {
              const homeMeta = getClubMeta(f.homeClub);
              const awayMeta = getClubMeta(f.awayClub);
              const active = selectedFixture?.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFixture(f);
                    setSelectedPlayer(null);
                    setStats({ ...EMPTY_MATCH_EVENT_DATA });
                  }}
                  style={{
                    padding: '10px 14px', borderRadius: '8px', border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                    background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}>
                  <ClubLogo clubName={f.homeClub} size={18} showBorder={false} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: homeMeta.color, background: homeMeta.bg, padding: '2px 5px', borderRadius: '4px' }}>{homeMeta.abbr}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>vs</span>
                  <ClubLogo clubName={f.awayClub} size={18} showBorder={false} />
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
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {availablePlayers.map(p => {
                const cm = getClubMeta(p.club);
                const active = selectedPlayer?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlayer(p);
                      setStats({
                        ...EMPTY_MATCH_EVENT_DATA,
                        isStartingPlayer: p.matchStatus !== 'bench',
                        isSubstitute: p.matchStatus === 'bench',
                      });
                    }}
                    style={{
                      padding: '8px 12px', borderRadius: '7px',
                      border: `1px solid ${active ? 'var(--gold)' : 'transparent'}`,
                      background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                    }}>
                    <PlayerAvatar name={p.name} headshotUrl={p.headshot_url} clubName={p.club} size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: cm.color, background: cm.bg, padding: '1px 5px', borderRadius: '3px' }}>{cm.abbr}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: active ? 700 : 400 }}>{p.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{p.position}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Enter stats with Unified Matrix */}
        {selectedPlayer && (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Step 3 — Unified Tisini Match Stats
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedPlayer.name} ({selectedPlayer.position}) · {isForward ? '🏉 Forward' : '⚡ Back'}
                </div>
              </div>
              <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={11} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* ── Section A: Appearance & Match Result ── */}
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Match Appearance &amp; Team Result
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.isStartingPlayer}
                      onChange={e => {
                        updateStat('isStartingPlayer', e.target.checked);
                        if (e.target.checked) updateStat('isSubstitute', false);
                      }}
                    />
                    Starting Player (+2.0)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.isSubstitute}
                      onChange={e => {
                        updateStat('isSubstitute', e.target.checked);
                        if (e.target.checked) updateStat('isStartingPlayer', false);
                      }}
                    />
                    Substitute (+1.0)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.teamWon}
                      onChange={e => {
                        updateStat('teamWon', e.target.checked);
                        if (e.target.checked) updateStat('teamDraw', false);
                      }}
                    />
                    Team Won (+2.0)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.teamDraw}
                      onChange={e => {
                        updateStat('teamDraw', e.target.checked);
                        if (e.target.checked) updateStat('teamWon', false);
                      }}
                    />
                    Team Drew (+1.0)
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Minutes Played (Legacy)</span>
                  <input
                    type="number" min={0} max={100}
                    value={stats.minutesPlayed}
                    onChange={e => updateStat('minutesPlayed', Number(e.target.value))}
                    style={{ width: '64px', padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#FFF', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* ── Section B: Scoring Plays ── */}
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Scoring Plays
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { key: 'tries', label: 'Tries (+5.0)', max: 10 },
                    { key: 'tryAssists', label: 'Try Assists (+2.0)', max: 10 },
                    { key: 'conversions', label: 'Conversions (+2.0)', max: 15 },
                    { key: 'penaltyGoals', label: 'Penalty Goals (+3.0)', max: 15 },
                    { key: 'penaltyKicksMissed', label: 'Penalty Missed (-0.5)', max: 10 },
                    { key: 'dropGoals', label: 'Drop Goals (+3.0)', max: 10 },
                  ].map(({ key, label, max }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
                      <input
                        type="number" min={0} max={max}
                        value={stats[key as keyof MatchEventData] as number}
                        onChange={e => updateStat(key as keyof MatchEventData, Number(e.target.value))}
                        style={{ width: '56px', padding: '4px 6px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#FFF', textAlign: 'center', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section C: Forward Set-Piece Mastery ── */}
              <div style={{
                padding: '14px', borderRadius: '10px',
                background: isForward ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255, 255, 255, 0.015)',
                border: isForward ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isForward ? 'var(--gold)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Team Forward Set-Piece Mastery
                  </div>
                  {isForward ? (
                    <span className="badge badge-gold" style={{ fontSize: '9px' }}>🏉 FORWARD ACTIVE</span>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Applies exclusively to Forwards</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.forwardsScrumsWon100}
                      onChange={e => updateStat('forwardsScrumsWon100', e.target.checked)}
                    />
                    Win 100% of Own Scrums (+2.0 each forward)
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scrums Won on Opponent Put-in (+1.0/scrum)</span>
                    <input
                      type="number" min={0} max={10}
                      value={stats.forwardsScrumsWonOpponent}
                      onChange={e => updateStat('forwardsScrumsWonOpponent', Number(e.target.value))}
                      style={{ width: '56px', padding: '4px 6px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#FFF', textAlign: 'center', fontSize: '12px' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.forwardsLineoutsWon90}
                      onChange={e => updateStat('forwardsLineoutsWon90', e.target.checked)}
                    />
                    Win 90%+ of Own Lineouts (+2.0 each forward)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={stats.forwardsLineoutsStolen20}
                      onChange={e => updateStat('forwardsLineoutsStolen20', e.target.checked)}
                    />
                    Win 20%+ of Opposition Lineouts (+1.0 each forward)
                  </label>
                </div>
              </div>

              {/* ── Section D: Individual Gameplay & Carrying ── */}
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Individual Gameplay &amp; Carrying
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  {[
                    { key: 'metresCarried', label: 'Metres Carried (+0.5/5m)', max: 300 },
                    { key: 'carries', label: 'Carries (Legacy fallback)', max: 50 },
                    { key: 'tackles', label: 'Tackles (+1.0/5 tackles)', max: 50 },
                    { key: 'cleanBreaks', label: 'Clean Breaks (+1.0)', max: 15 },
                    { key: 'defendersBeaten', label: 'Defenders Beaten (+1.0/2)', max: 20 },
                    { key: 'turnoversWon', label: 'Turnovers Won (+1.0)', max: 15 },
                    { key: 'lineoutsStolenIndividual', label: 'Lineouts Stolen (+1.0)', max: 10 },
                    { key: 'kicks50_22', label: '50:22 Kicks (+2.0)', max: 5 },
                  ].map(({ key, label, max }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
                      <input
                        type="number" min={0} max={max}
                        value={stats[key as keyof MatchEventData] as number}
                        onChange={e => updateStat(key as keyof MatchEventData, Number(e.target.value))}
                        style={{ width: '56px', padding: '4px 6px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#FFF', textAlign: 'center', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--gold)', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={stats.playerOfTheMatch}
                    onChange={e => updateStat('playerOfTheMatch', e.target.checked)}
                  />
                  🏆 Player of the Match (POTM) (+3.0 pts)
                </label>
              </div>

              {/* ── Section E: Discipline & Deductions ── */}
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Discipline &amp; Deductions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { key: 'missedTackles', label: 'Missed Tackles (-0.5)', max: 20 },
                    { key: 'handlingErrors', label: 'Knock-on / Error (-0.5)', max: 20 },
                    { key: 'penaltiesConceded', label: 'Penalty Conceded (-1.0)', max: 20 },
                    { key: 'yellowCards', label: 'Yellow Cards (-4.0)', max: 2 },
                    { key: 'redCards', label: 'Red Cards (-8.0)', max: 1 },
                  ].map(({ key, label, max }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#FCA5A5' }}>{label}</span>
                      <input
                        type="number" min={0} max={max}
                        value={stats[key as keyof MatchEventData] as number}
                        onChange={e => updateStat(key as keyof MatchEventData, Number(e.target.value))}
                        style={{ width: '56px', padding: '4px 6px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFF', textAlign: 'center', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section F: Legacy Set-Piece Counts ── */}
              <details style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ⚙️ Legacy Set-Piece Counts (Optional Scrums/Lineouts)
                </summary>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {[
                    { key: 'scrumsWon', label: 'Scrums Won' },
                    { key: 'scrumsLost', label: 'Scrums Lost' },
                    { key: 'lineoutsWon', label: 'Lineouts Won' },
                    { key: 'lineoutsLost', label: 'Lineouts Lost' },
                  ].map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '11px' }}>{label}</span>
                      <input
                        type="number" min={0} max={20}
                        value={stats[key as keyof MatchEventData] as number}
                        onChange={e => updateStat(key as keyof MatchEventData, Number(e.target.value))}
                        style={{ width: '56px', padding: '4px 6px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#FFF', textAlign: 'center', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
              </details>

            </div>

            <button onClick={handleSave} className="btn btn-gold" style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '14px', fontWeight: 800 }}>
              {saved ? <><Check size={16} /> Saved to match_events!</> : <><Save size={16} /> Save Unified Override</>}
            </button>
          </div>
        )}
      </div>

      {/* ── Right: Preview + Saved Entries ─────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>

        {/* Live points preview */}
        {selectedPlayer && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(57,255,20,0.06))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '16px', padding: '24px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Calculated Matchday Points
            </div>
            <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 700, marginBottom: '6px' }}>
              {selectedPlayer.name} ({selectedPlayer.position})
            </div>
            <div className="font-condensed" style={{ fontSize: '80px', fontWeight: 900, lineHeight: 1, color: 'var(--gold)' }}>
              {previewPoints}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              fantasy points (×2 if captain, ×3 if triple captain)
            </div>

            {/* Quick mini-breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '18px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px 8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  {stats.tries}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tries (+{stats.tries * 5})</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px 8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  {stats.conversions + stats.penaltyGoals + stats.dropGoals}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kicks</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px 8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  {stats.metresCarried > 0 ? `${stats.metresCarried}m` : stats.carries}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carrying</div>
              </div>
            </div>

            {isForward && (stats.forwardsScrumsWon100 || stats.forwardsLineoutsWon90) && (
              <div style={{ marginTop: '12px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>
                🏉 Forward Set-Piece Bonus Applied!
              </div>
            )}
          </div>
        )}

        {/* Saved entries log */}
        {savedEntries.length > 0 && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700 }}>Saved Override Log</h3>
            </div>
            {savedEntries.map(({ player, pts }, idx) => {
              const cm = getClubMeta(player.club);
              return (
                <div key={`${player.id}-${idx}`} style={{
                  padding: '12px 16px', borderBottom: idx < savedEntries.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <PlayerAvatar name={player.name} headshotUrl={player.headshot_url} clubName={player.club} size={28} />
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
          💡 <strong>Backward Compatible:</strong> The scoring engine unifies legacy columns (<code>minutesPlayed</code>, <code>carries</code>, <code>lineoutsWon</code>) and new Kenya Cup metrics (<code>forwardsScrumsWon100</code>, <code>kicks50_22</code>, <code>metresCarried</code>).
        </div>
      </div>
    </div>
  );
}
