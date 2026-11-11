'use client';
import { useState, useEffect } from 'react';
import { MOCK_GAMEWEEKS } from '@/lib/mockData';
import { usePlayersStore } from '@/lib/playerStore';
import { useClubsStore } from '@/lib/clubStore';
import { useSquadStore } from '@/store/squadStore';
import { useLeagueStore } from '@/lib/leagueStore';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { ClubLogo } from '@/components/common/ClubLogo';
import { calculatePoints, SCORING_RULES } from '@/lib/fantasyRules';
import { ChevronLeft, ChevronRight, Star, Crown, Repeat, Users, Shield } from 'lucide-react';

// Generate mock gameweek stats for each player
function generateMockStats(playerId: string, gameweek: number) {
  const seed = (playerId.charCodeAt(0) || 65) + (playerId.charCodeAt(1) || 66) + gameweek;
  const rng = (n: number) => Math.floor((Math.sin(seed * n) * 0.5 + 0.5) * 10);
  return {
    playerId,
    gameweek,
    minutesPlayed: [0, 30, 60, 80][rng(1) % 4],
    tries: rng(2) % 3 === 0 ? 1 : 0,
    tryAssists: rng(3) % 4 === 0 ? 1 : 0,
    conversions: rng(4) % 5,
    penaltyGoals: rng(5) % 3,
    dropGoals: 0,
    tackles: rng(6) % 12,
    carries: rng(7) % 8,
    lineoutsWon: rng(8) % 4,
    lineoutsLost: rng(9) % 2,
    scrumWon: rng(10) % 3,
    scrumLost: rng(11) % 2,
    yellowCards: 0,
    redCards: 0,
    points: 0,
  };
}

export function PointsPage() {
  const { players, fetchPlayers } = usePlayersStore();
  const { getClubMeta, fetchClubs } = useClubsStore();
  const { squad, captainId, viceCaptainId, activeBooster } = useSquadStore();

  useEffect(() => {
    fetchPlayers();
    fetchClubs();
  }, [fetchPlayers, fetchClubs]);

  const completedGWs = MOCK_GAMEWEEKS.filter(gw => gw.status !== 'upcoming');
  const [activeGW, setActiveGW] = useState(completedGWs[completedGWs.length - 1]);

  const isBenchBoostActive = activeBooster === 'BENCH_BOOST' || activeBooster === 'bench';

  // Build 23-man squad representation: user squad if populated, or top 23 players fallback
  const squadPlayers = squad.length > 0
    ? squad.map(sp => ({
        player: players.find(p => p.id === sp.player.id || p.name.toLowerCase() === sp.player.name?.toLowerCase()) || sp.player,
        isCaptain: String(sp.playerId) === String(captainId),
        isViceCaptain: String(sp.playerId) === String(viceCaptainId),
        rosterStatus: (sp.rosterStatus || (sp.pitchSlot <= 15 ? 'STARTER' : 'BENCH')) as 'STARTER' | 'BENCH',
        pitchSlot: sp.pitchSlot || 1,
      }))
    : players.slice(0, 23).map((p, i) => ({
        player: p,
        isCaptain: i === 0,
        isViceCaptain: i === 1,
        rosterStatus: (i < 15 ? 'STARTER' : 'BENCH') as 'STARTER' | 'BENCH',
        pitchSlot: i + 1,
      }));

  const squadWithPoints = squadPlayers.map(({ player, isCaptain, isViceCaptain, rosterStatus, pitchSlot }) => {
    const stats = generateMockStats(player.id, activeGW.number);
    stats.points = calculatePoints(stats, false, null, false, player.matchStatus, 'STARTER', player.position);
    const gwPoints = calculatePoints(stats, isCaptain, activeBooster, isViceCaptain, player.matchStatus, rosterStatus, player.position);
    return { player, stats, isCaptain, isViceCaptain, rosterStatus, pitchSlot, gwPoints };
  });

  const startersWithPoints = squadWithPoints.filter(p => p.rosterStatus === 'STARTER');
  const benchWithPoints = squadWithPoints.filter(p => p.rosterStatus === 'BENCH');

  const startersPoints = startersWithPoints.reduce((sum, p) => sum + p.gwPoints, 0);
  const benchPoints = benchWithPoints.reduce((sum, p) => {
    // calculate raw points bench players generated
    const raw = calculatePoints(p.stats, p.isCaptain, 'BENCH_BOOST', p.isViceCaptain, p.player.matchStatus, 'BENCH', p.player.position);
    return sum + (isBenchBoostActive ? p.gwPoints : raw);
  }, 0);

  const totalGWPoints = startersPoints + (isBenchBoostActive ? benchWithPoints.reduce((sum, p) => sum + p.gwPoints, 0) : 0);
  const syncUserScore = useLeagueStore(s => s.syncUserScore);

  useEffect(() => {
    if (totalGWPoints > 0) {
      syncUserScore(totalGWPoints, 534 + totalGWPoints);
    }
  }, [totalGWPoints, syncUserScore]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-condensed" style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>
          Gameweek Points
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Season 26/27 · 23-Man matchday roster points breakdown</p>
      </div>

      {/* Gameweek selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => {
            const idx = completedGWs.findIndex(gw => gw.id === activeGW.id);
            if (idx > 0) setActiveGW(completedGWs[idx - 1]);
          }}
          className="btn btn-outline"
          style={{ padding: '8px 12px' }}
          disabled={completedGWs[0].id === activeGW.id}
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          {completedGWs.map(gw => (
            <button key={gw.id}
              onClick={() => setActiveGW(gw)}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                background: gw.id === activeGW.id ? 'rgba(212,175,55,0.15)' : 'var(--bg-card)',
                border: `1px solid ${gw.id === activeGW.id ? 'var(--gold)' : 'var(--border)'}`,
                color: gw.id === activeGW.id ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {gw.name}
              {gw.status === 'active' && (
                <span style={{ marginLeft: '6px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon)', display: 'inline-block', verticalAlign: 'middle' }} />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const idx = completedGWs.findIndex(gw => gw.id === activeGW.id);
            if (idx < completedGWs.length - 1) setActiveGW(completedGWs[idx + 1]);
          }}
          className="btn btn-outline"
          style={{ padding: '8px 12px' }}
          disabled={completedGWs[completedGWs.length - 1].id === activeGW.id}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Bench Boost Active Alert Banner */}
      {isBenchBoostActive && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          borderRadius: '12px',
          background: 'rgba(16,185,129,0.18)',
          border: '1.5px solid rgba(16,185,129,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Repeat size={18} color="#000" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#34D399' }}>
              ⚡ Bench Boost Chip Active for {activeGW.name}!
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
              All 8 substitute bench reserves scored points! +{benchWithPoints.reduce((s, p) => s + p.gwPoints, 0)} reserve points added to your score.
            </div>
          </div>
        </div>
      )}

      {/* Total score card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(57,255,20,0.05) 100%)',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {activeGW.name} · Total Score
          </div>
          <div className="font-condensed" style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, color: 'var(--gold)' }}>
            {totalGWPoints}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>Starters: <strong>{startersPoints} pts</strong></span>
            <span>·</span>
            <span style={{ color: isBenchBoostActive ? '#34D399' : 'var(--text-muted)' }}>
              Bench: <strong>{isBenchBoostActive ? benchWithPoints.reduce((s, p) => s + p.gwPoints, 0) : 0} pts</strong>
              {isBenchBoostActive ? ' (Bench Boost)' : ` (${benchPoints} uncounted)`}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: 'Tries', value: squadWithPoints.reduce((s, p) => s + (isBenchBoostActive || p.rosterStatus === 'STARTER' ? p.stats.tries : 0), 0) },
            { label: 'Assists', value: squadWithPoints.reduce((s, p) => s + (isBenchBoostActive || p.rosterStatus === 'STARTER' ? p.stats.tryAssists : 0), 0) },
            { label: 'Tackles', value: squadWithPoints.reduce((s, p) => s + (isBenchBoostActive || p.rosterStatus === 'STARTER' ? p.stats.tackles : 0), 0) },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="font-condensed" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Rules Reference */}
      <details style={{ marginBottom: '24px' }}>
        <summary style={{ cursor: 'pointer', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', userSelect: 'none' }}>
          📋 Scoring Rules Reference
        </summary>
        <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
            {Object.entries(SCORING_RULES).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-card)', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: (val as number) >= 0 ? 'var(--gold)' : 'var(--danger)' }}>
                  {(val as number) > 0 ? '+' : ''}{val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* ── Starting XV Player breakdown table ── */}
      <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--gold)" />
            <h2 style={{ fontSize: '14px', fontWeight: 800 }}>Starting XV (15 Players) — {activeGW.name}</h2>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>
            Subtotal: {startersPoints} pts
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Player', 'Club', 'Pos', 'Mins', 'T', 'A', 'Con', 'PG', 'Tkl', 'Pts'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Player' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {startersWithPoints
                .sort((a, b) => a.pitchSlot - b.pitchSlot)
                .map(({ player, stats, isCaptain, isViceCaptain, pitchSlot, gwPoints }, i) => {
                  const clubMeta = getClubMeta(player.club);
                  return (
                    <tr key={player.id} style={{
                      borderBottom: i < startersWithPoints.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isCaptain ? 'rgba(212,175,55,0.06)' : isViceCaptain ? 'rgba(139,92,246,0.05)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => !isCaptain && !isViceCaptain && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isCaptain ? 'rgba(212,175,55,0.06)' : isViceCaptain ? 'rgba(139,92,246,0.05)' : 'transparent')}
                    >
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--gold)' }}>
                        #{pitchSlot}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PlayerAvatar
                            name={player.name}
                            headshotUrl={player.headshot_url}
                            clubName={player.club}
                            size={28}
                          />
                          {isCaptain && <Crown size={12} color="var(--gold)" />}
                          {isViceCaptain && <Star size={12} color="#8B5CF6" />}
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{player.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ClubLogo
                            clubName={player.club}
                            logoUrl={player.clubs?.logo_url || player.club_logo_url}
                            size={18}
                            showBorder={false}
                          />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '2px 5px', borderRadius: '3px' }}>
                            {clubMeta.abbr}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {player.position.slice(0, 3)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: stats.minutesPlayed >= 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {stats.minutesPlayed}&apos;
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: stats.tries ? 'var(--neon)' : 'var(--text-muted)' }}>
                        {stats.tries}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: stats.tryAssists ? 'var(--gold)' : 'var(--text-muted)' }}>
                        {stats.tryAssists}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {stats.conversions}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {stats.penaltyGoals}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {stats.tackles}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span className="font-condensed" style={{ fontSize: '20px', fontWeight: 800, color: gwPoints >= 15 ? 'var(--neon)' : gwPoints >= 10 ? 'var(--gold)' : 'var(--text-primary)' }}>
                            {gwPoints}
                          </span>
                          {isCaptain && <span style={{ fontSize: '9px', background: 'var(--gold)', color: '#000', borderRadius: '3px', padding: '1px 3px', fontWeight: 800 }}>{activeBooster === 'triple' ? 'x3' : 'x2'}</span>}
                          {isViceCaptain && activeBooster === 'co' && <span style={{ fontSize: '9px', background: '#3B82F6', color: '#FFF', borderRadius: '3px', padding: '1px 3px', fontWeight: 800 }}>x2</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Substitutes Bench (8 Reserves) breakdown table ── */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#10B981" />
            <h2 style={{ fontSize: '14px', fontWeight: 800 }}>Substitutes Bench (8 Reserves) — {activeGW.name}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isBenchBoostActive ? (
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#34D399', background: 'rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '5px' }}>
                ⚡ Bench Boost Active: +{benchWithPoints.reduce((s, p) => s + p.gwPoints, 0)} pts scored
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Bench reserves score 0 pts (Standard Gameweek)
              </span>
            )}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Player', 'Club', 'Pos', 'Mins', 'T', 'A', 'Con', 'PG', 'Tkl', 'Pts'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Player' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benchWithPoints
                .sort((a, b) => a.pitchSlot - b.pitchSlot)
                .map(({ player, stats, pitchSlot, gwPoints }, i) => {
                  const clubMeta = getClubMeta(player.club);
                  const rawPts = calculatePoints(stats, false, 'BENCH_BOOST', false, player.matchStatus, 'BENCH');
                  return (
                    <tr key={player.id} style={{
                      borderBottom: i < benchWithPoints.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isBenchBoostActive ? 'rgba(16,185,129,0.04)' : 'transparent',
                      opacity: isBenchBoostActive ? 1 : 0.75,
                      transition: 'background 0.15s',
                    }}>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: isBenchBoostActive ? '#34D399' : 'var(--text-muted)' }}>
                        #{pitchSlot}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PlayerAvatar
                            name={player.name}
                            headshotUrl={player.headshot_url}
                            clubName={player.club}
                            size={28}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{player.name}</span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: isBenchBoostActive ? '#34D399' : 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>
                            SUB
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ClubLogo
                            clubName={player.club}
                            logoUrl={player.clubs?.logo_url || player.club_logo_url}
                            size={18}
                            showBorder={false}
                          />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '2px 5px', borderRadius: '3px' }}>
                            {clubMeta.abbr}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {player.position.slice(0, 3)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: stats.minutesPlayed >= 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {stats.minutesPlayed}&apos;
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: stats.tries ? 'var(--neon)' : 'var(--text-muted)' }}>
                        {stats.tries}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: stats.tryAssists ? 'var(--gold)' : 'var(--text-muted)' }}>
                        {stats.tryAssists}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {stats.conversions}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {stats.penaltyGoals}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {stats.tackles}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span className="font-condensed" style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: isBenchBoostActive ? (gwPoints >= 10 ? 'var(--neon)' : 'var(--gold)') : 'var(--text-muted)',
                          }}>
                            {isBenchBoostActive ? gwPoints : 0}
                          </span>
                          {!isBenchBoostActive && (
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              ({rawPts})
                            </span>
                          )}
                          {isBenchBoostActive && player.matchStatus === 'bench' && (
                            <span style={{ fontSize: '8px', background: '#10B981', color: '#000', borderRadius: '3px', padding: '1px 3px', fontWeight: 800 }}>
                              +50%
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-surface)', borderTop: '2px solid var(--border)' }}>
                <td colSpan={10} style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Total Matchday Gameweek Points (Starters {startersPoints} {isBenchBoostActive ? `+ Bench ${benchWithPoints.reduce((s, p) => s + p.gwPoints, 0)}` : '+ Bench 0'})
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                  <span className="font-condensed" style={{ fontSize: '24px', fontWeight: 900, color: 'var(--gold)' }}>
                    {totalGWPoints}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
