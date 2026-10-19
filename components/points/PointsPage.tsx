'use client';
import { useState } from 'react';
import { MOCK_GAMEWEEKS, MOCK_PLAYERS, CLUB_META } from '@/lib/mockData';
import { calculatePoints, SCORING_RULES } from '@/lib/fantasyRules';
import { ChevronLeft, ChevronRight, Star, Crown } from 'lucide-react';

// Generate mock gameweek stats for each player
function generateMockStats(playerId: string, gameweek: number) {
  const seed = playerId.charCodeAt(1) + gameweek;
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
  const completedGWs = MOCK_GAMEWEEKS.filter(gw => gw.status !== 'upcoming');
  const [activeGW, setActiveGW] = useState(completedGWs[completedGWs.length - 1]);

  // Use top 15 players as the "squad" for mock display
  const mockSquad = MOCK_PLAYERS.slice(0, 15).map((p, i) => ({
    player: p,
    isCaptain: i === 0,
    isViceCaptain: i === 1,
  }));

  const squadWithPoints = mockSquad.map(({ player, isCaptain, isViceCaptain }) => {
    const stats = generateMockStats(player.id, activeGW.number);
    stats.points = calculatePoints(stats, false);
    const gwPoints = calculatePoints(stats, isCaptain);
    return { player, stats, isCaptain, isViceCaptain, gwPoints };
  });

  const totalGWPoints = squadWithPoints.reduce((sum, p) => sum + p.gwPoints, 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-condensed" style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>
          Gameweek Points
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Season 26/27 · Points breakdown per round</p>
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
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>fantasy points</div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: 'Tries', value: squadWithPoints.reduce((s, p) => s + p.stats.tries, 0) },
            { label: 'Assists', value: squadWithPoints.reduce((s, p) => s + p.stats.tryAssists, 0) },
            { label: 'Tackles', value: squadWithPoints.reduce((s, p) => s + p.stats.tackles, 0) },
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

      {/* Player breakdown table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Player Breakdown — {activeGW.name}</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['Player', 'Club', 'Pos', 'Mins', 'T', 'A', 'Con', 'PG', 'Tkl', 'Pts'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Player' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {squadWithPoints
                .sort((a, b) => b.gwPoints - a.gwPoints)
                .map(({ player, stats, isCaptain, isViceCaptain, gwPoints }, i) => {
                  const clubMeta = CLUB_META[player.club];
                  return (
                    <tr key={player.id} style={{
                      borderBottom: i < 14 ? '1px solid var(--border)' : 'none',
                      background: isCaptain ? 'rgba(212,175,55,0.05)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => !isCaptain && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isCaptain ? 'rgba(212,175,55,0.05)' : 'transparent')}
                    >
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isCaptain && <Crown size={12} color="var(--gold)" />}
                          {isViceCaptain && <Star size={12} color="#8B5CF6" />}
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{player.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '2px 5px', borderRadius: '3px' }}>
                          {clubMeta.abbr}
                        </span>
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
                          {isCaptain && <span style={{ fontSize: '9px', background: 'var(--gold)', color: '#000', borderRadius: '3px', padding: '1px 3px', fontWeight: 800 }}>x2</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-surface)', borderTop: '2px solid var(--border)' }}>
                <td colSpan={9} style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Total Gameweek Points
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
