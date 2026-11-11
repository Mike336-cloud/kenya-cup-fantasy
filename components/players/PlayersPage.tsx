'use client';
import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { POSITION_ABBR } from '@/lib/mockData';
import { formatCost, getPositionCategory } from '@/lib/fantasyRules';
import { useSquadStore } from '@/store/squadStore';
import { usePlayersStore } from '@/lib/playerStore';
import { useClubsStore } from '@/lib/clubStore';
import { Player, Club, Tier } from '@/types/fantasy';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { ClubLogo } from '@/components/common/ClubLogo';

const POSITION_PILLS = ['All', 'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 'Scrum-half', 'Fly-half', 'Center', 'Wing', 'Fullback'];
const TIERS: Tier[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
const CLUBS: Club[] = ['Kabras Sugar', 'KCB Rugby', 'Menengai Oilers', 'Kenya Harlequin', 'Strathmore Leos', 'KU Blak Blad', 'Nondescripts', 'Nakuru', 'Daystar Falcons', 'Impala', 'Mwamba', 'JKUAT Cougars'];
const SORT_OPTIONS = [
  { value: 'totalPoints', label: 'Total Points' },
  { value: 'form', label: 'Form' },
  { value: 'cost_desc', label: 'Price: High → Low' },
  { value: 'cost_asc', label: 'Price: Low → High' },
];

function FormBar({ form }: { form: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          width: '4px', height: i < form ? '12px' : '6px',
          borderRadius: '2px',
          background: i < form
            ? form >= 8 ? 'var(--neon)' : form >= 6 ? 'var(--gold)' : 'var(--warning)'
            : 'var(--border-light)',
          transition: 'height 0.3s ease',
        }} />
      ))}
    </div>
  );
}

function PlayerCard({ player, inSquad, onAdd, onRemove }: {
  player: Player;
  inSquad: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const getClubMeta = useClubsStore(s => s.getClubMeta);
  const clubMeta = getClubMeta(player.club);
  const tierColors: Record<Tier, string> = {
    'Tier 1': 'badge-gold',
    'Tier 2': 'badge-blue',
    'Tier 3': 'badge-purple',
    'Tier 4': 'badge-green',
  };

  return (
    <div className="card" style={{
      padding: '0', overflow: 'hidden',
      transition: 'all 0.2s',
      border: inSquad ? '1px solid rgba(212,175,55,0.4)' : '1px solid var(--border)',
      background: inSquad ? 'rgba(212,175,55,0.04)' : 'var(--bg-card)',
    }}>
      {/* Club color stripe */}
      <div style={{ height: '3px', background: clubMeta.color }} />

      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          {/* Avatar with headshot support */}
          <PlayerAvatar
            name={player.name}
            headshotUrl={player.headshot_url}
            clubName={player.club}
            size={46}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Club logo + abbreviation */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ClubLogo
                  clubName={player.club}
                  logoUrl={player.clubs?.logo_url || player.club_logo_url}
                  size={18}
                  showBorder={false}
                />
                <span style={{ fontSize: '10px', fontWeight: 700, color: clubMeta.color, background: clubMeta.bg, padding: '2px 5px', borderRadius: '4px' }}>
                  {clubMeta.abbr}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
                {player.position}
              </span>
              <span className={`badge ${tierColors[player.tier]}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                {player.tier}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>{formatCost(player.cost)}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '8px', padding: '8px 10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>TOTAL PTS</div>
            <div className="font-condensed" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
              {player.totalPoints}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '8px', padding: '8px 10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>FORM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FormBar form={Math.round(player.form)} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: player.form >= 8 ? 'var(--neon)' : player.form >= 6 ? 'var(--gold)' : 'var(--warning)' }}>
                {player.form.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Special badges */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {player.isFrontRow && <span className="badge badge-red" style={{ fontSize: '9px', padding: '1px 5px' }}>Front Row</span>}
          {player.isJumper && <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 5px' }}>Jumper</span>}
          {player.isHooker && <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 5px' }}>Hooker</span>}
        </div>

        {/* Action button */}
        {inSquad ? (
          <button onClick={onRemove} className="btn btn-danger" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
            <X size={13} /> Remove
          </button>
        ) : (
          <button onClick={onAdd} className="btn btn-neon" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
            <Plus size={13} /> Add to Squad
          </button>
        )}
      </div>
    </div>
  );
}

export function PlayersPage() {
  const { squad, addPlayer, removePlayer, getRemainingBudget } = useSquadStore();
  const { players, fetchPlayers } = usePlayersStore();
  const { fetchClubs } = useClubsStore();
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<string>('All');
  const [clubFilter, setClubFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState('totalPoints');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
    fetchClubs();
  }, [fetchPlayers, fetchClubs]);

  const squadIds = squad.map(sp => sp.playerId);
  const remaining = getRemainingBudget();

  const filtered = useMemo(() => {
    let list = [...players];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase()));
    if (posFilter !== 'All') {
      list = list.filter(p => p.position === posFilter || getPositionCategory(p.position) === posFilter);
    }
    if (clubFilter !== 'All') list = list.filter(p => p.club === clubFilter);
    if (tierFilter !== 'All') list = list.filter(p => p.tier === tierFilter);

    list.sort((a, b) => {
      if (sortBy === 'totalPoints') return b.totalPoints - a.totalPoints;
      if (sortBy === 'form') return b.form - a.form;
      if (sortBy === 'cost_desc') return b.cost - a.cost;
      if (sortBy === 'cost_asc') return a.cost - b.cost;
      return 0;
    });
    return list;
  }, [players, search, posFilter, clubFilter, tierFilter, sortBy]);

  const handleAdd = (player: Player) => {
    const result = addPlayer(player);
    if (!result.isValid) {
      setNotification(result.errors[0]);
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification(`✓ ${player.name} added!`);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="font-condensed" style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>
          Player Browser
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {filtered.length} players · Budget remaining: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatCost(remaining)}</span>
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
          background: notification.startsWith('✓') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${notification.startsWith('✓') ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '10px', padding: '12px 20px',
          color: notification.startsWith('✓') ? '#34D399' : '#FCA5A5',
          fontSize: '13px', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slide-up 0.3s ease',
        }}>
          {notification}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }} />
        </div>

        {/* Position filter */}
        <select className="input" value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="All">All Positions</option>
          <optgroup label="The Tight Five">
            <option value="Loosehead Prop">Loosehead Prop</option>
            <option value="Hooker">Hooker</option>
            <option value="Tighthead Prop">Tighthead Prop</option>
            <option value="Lock">Lock</option>
          </optgroup>
          <optgroup label="The Back Row">
            <option value="Blindside Flanker">Blindside Flanker</option>
            <option value="Openside Flanker">Openside Flanker</option>
            <option value="Number 8">Number 8</option>
          </optgroup>
          <optgroup label="The Halfbacks">
            <option value="Scrum-half">Scrum-half</option>
            <option value="Fly-half">Fly-half</option>
          </optgroup>
          <optgroup label="The Midfield & Outside Backs">
            <option value="Inside Center">Inside Center</option>
            <option value="Outside Center">Outside Center</option>
            <option value="Left Wing">Left Wing</option>
            <option value="Right Wing">Right Wing</option>
            <option value="Fullback">Fullback</option>
          </optgroup>
          <optgroup label="Utility & Broad">
            <option value="Utility Back">Utility Back</option>
            <option value="Front Row">Front Row</option>
            <option value="Back Row">Back Row</option>
          </optgroup>
        </select>

        {/* Club filter */}
        <select className="input" value={clubFilter} onChange={e => setClubFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="All">All Clubs</option>
          {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Tier filter */}
        <select className="input" value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="All">All Tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Sort */}
        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Position quick-filter pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {POSITION_PILLS.map(p => (
          <button key={p}
            onClick={() => setPosFilter(p)}
            style={{
              padding: '5px 12px', borderRadius: '100px',
              border: `1px solid ${posFilter === p ? 'var(--gold)' : 'var(--border)'}`,
              background: posFilter === p ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: posFilter === p ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {p === 'All' ? 'All' : POSITION_ABBR[p] ?? p}
          </button>
        ))}
      </div>

      {/* Player grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {filtered.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            inSquad={squadIds.includes(player.id)}
            onAdd={() => handleAdd(player)}
            onRemove={() => removePlayer(player.id)}
          />
        ))}
      </div>
    </div>
  );
}
