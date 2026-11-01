import { Player, Club, Position, Tier, PositionGroup, Fixture, Gameweek } from '@/types/fantasy';

// ─────────────────────────────────────────────────────────────────────────────
// Helper to generate players
// ─────────────────────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `p${String(_id++).padStart(3, '0')}`;

function mkPlayer(
  name: string,
  club: Club,
  position: Position,
  tier: Tier,
  cost: number,
  form: number,
  totalPoints: number,
  extra?: Partial<Player>
): Player {
  const forwardPositions: Position[] = ['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8'];
  const positionGroup: PositionGroup = forwardPositions.includes(position) ? 'Forward' : 'Back';

  // Kickoff times spread across a gameweek weekend
  // IMPORTANT: use deterministic index (_id) instead of Math.random()
  // to avoid Next.js hydration mismatch (server vs client render differently)
  const kickoffTimes = [
    '2026-10-03T14:00:00+03:00',
    '2026-10-03T16:30:00+03:00',
    '2026-10-04T14:00:00+03:00',
    '2026-10-04T16:30:00+03:00',
  ];
  const matchKickoffTime = kickoffTimes[(_id - 1) % kickoffTimes.length];

  const isInjured = extra?.isInjured ?? false;
  const isSuspended = extra?.isSuspended ?? false;
  const matchStatus = isInjured ? 'injured' : isSuspended ? 'suspended' : (extra?.matchStatus ?? 'starting');

  return {
    id: uid(),
    name,
    club,
    position,
    positionGroup,
    isJumper: position === 'Lock' || (position === 'Flanker' && extra?.isJumper === true),
    isHooker: position === 'Hooker',
    isFrontRow: position === 'Prop' || position === 'Hooker',
    tier,
    cost,
    matchKickoffTime,
    form,
    totalPoints,
    isInjured,
    isSuspended,
    isActive: true,
    headshot_url: null,
    matchStatus,
    ...extra,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER ROSTER – 48 players across all 12 Kenya Cup clubs
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_PLAYERS: Player[] = [
  // ── Kabras Sugar (4 players) ──────────────────────────────────────────────
  mkPlayer('Brian Juma',        'Kabras Sugar', 'Prop',       'Tier 1', 10_000_000, 9.2, 187, { matchStatus: 'starting' }),
  mkPlayer('Vincent Onyala',    'Kabras Sugar', 'Wing',       'Tier 1', 10_000_000, 9.5, 201, { matchStatus: 'starting' }),
  mkPlayer('Griffin Musyoki',   'Kabras Sugar', 'Flanker',    'Tier 2',  7_500_000, 7.8, 134, { matchStatus: 'bench' }),
  mkPlayer('Samuel Asati',      'Kabras Sugar', 'Scrum-half', 'Tier 2',  7_500_000, 8.1, 142, { matchStatus: 'starting' }),

  // ── KCB Rugby (4 players) ─────────────────────────────────────────────────
  mkPlayer('Darwin Mukidza',    'KCB Rugby',    'Fly-half',   'Tier 1', 10_000_000, 9.0, 193, { isJumper: false, matchStatus: 'starting' }),
  mkPlayer('Curtis Lilako',     'KCB Rugby',    'Lock',       'Tier 2',  7_500_000, 7.5, 128, { matchStatus: 'bench' }),
  mkPlayer('Tony Odhiambo',     'KCB Rugby',    'Number 8',   'Tier 2',  7_500_000, 8.3, 151, { matchStatus: 'starting' }),
  mkPlayer('Alvin Otieno',      'KCB Rugby',    'Center',     'Tier 3',  5_500_000, 6.4, 98,  { matchStatus: 'injured', isInjured: true }),

  // ── Menengai Oilers (4 players) ───────────────────────────────────────────
  mkPlayer('Joseph Odero',      'Menengai Oilers', 'Hooker',    'Tier 1', 10_000_000, 8.7, 174, { matchStatus: 'starting' }),
  mkPlayer('Bethuel Anami',     'Menengai Oilers', 'Prop',      'Tier 2',  7_500_000, 7.2, 121, { matchStatus: 'starting' }),
  mkPlayer('Collins Shivachi',  'Menengai Oilers', 'Flanker',   'Tier 3',  5_500_000, 6.9, 109, { matchStatus: 'bench' }),
  mkPlayer('Rodney Wanjala',    'Menengai Oilers', 'Full-back', 'Tier 2',  7_500_000, 7.8, 138, { matchStatus: 'starting' }),

  // ── Kenya Harlequin (4 players) ───────────────────────────────────────────
  mkPlayer('Dan Sikuta',        'Kenya Harlequin', 'Lock',      'Tier 2',  7_500_000, 7.6, 130, { matchStatus: 'starting' }),
  mkPlayer('Moses Amusala',     'Kenya Harlequin', 'Fly-half',  'Tier 2',  7_500_000, 8.0, 145, { matchStatus: 'starting' }),
  mkPlayer('Peter Kilonzo',     'Kenya Harlequin', 'Wing',      'Tier 3',  5_500_000, 6.5, 101, { matchStatus: 'bench' }),
  mkPlayer('Timothy Wandera',   'Kenya Harlequin', 'Prop',      'Tier 3',  5_500_000, 6.2, 95,  { matchStatus: 'suspended', isSuspended: true }),

  // ── Strathmore Leos (4 players) ───────────────────────────────────────────
  mkPlayer('Michael Kariuki',   'Strathmore Leos', 'Scrum-half', 'Tier 2', 7_500_000, 7.9, 137, { matchStatus: 'starting' }),
  mkPlayer('Joshua Monda',      'Strathmore Leos', 'Center',     'Tier 2', 7_500_000, 7.4, 125, { matchStatus: 'starting' }),
  mkPlayer('Francis Oduya',     'Strathmore Leos', 'Number 8',   'Tier 3', 5_500_000, 6.8, 107, { matchStatus: 'bench' }),
  mkPlayer('Patrick Omondi',    'Strathmore Leos', 'Flanker',    'Tier 3', 5_500_000, 6.3, 97,  { matchStatus: 'starting' }),

  // ── KU Blak Blad (4 players) ──────────────────────────────────────────────
  mkPlayer('Charles Ooko',      'KU Blak Blad', 'Hooker',    'Tier 2', 7_500_000, 7.1, 118, { matchStatus: 'starting' }),
  mkPlayer('Edwin Oloo',        'KU Blak Blad', 'Lock',      'Tier 3', 5_500_000, 6.7, 104, { matchStatus: 'bench' }),
  mkPlayer('Paul Muriithi',     'KU Blak Blad', 'Center',    'Tier 3', 5_500_000, 6.0, 91,  { matchStatus: 'starting' }),
  mkPlayer('George Agutu',      'KU Blak Blad', 'Full-back', 'Tier 4', 3_500_000, 5.2, 68,  { matchStatus: 'starting' }),

  // ── Nondescripts (4 players) ──────────────────────────────────────────────
  mkPlayer('Ian Karanja',       'Nondescripts', 'Prop',       'Tier 2', 7_500_000, 7.3, 122, { matchStatus: 'starting' }),
  mkPlayer('David Wachira',     'Nondescripts', 'Flanker',    'Tier 2', 7_500_000, 7.5, 129, { matchStatus: 'starting' }),
  mkPlayer('Stephen Mwangi',    'Nondescripts', 'Wing',       'Tier 3', 5_500_000, 6.4, 99,  { matchStatus: 'bench' }),
  mkPlayer('Alex Muriuki',      'Nondescripts', 'Scrum-half', 'Tier 4', 3_500_000, 4.9, 61,  { matchStatus: 'injured', isInjured: true }),

  // ── Nakuru (4 players) ────────────────────────────────────────────────────
  mkPlayer('John Kamau',        'Nakuru', 'Lock',      'Tier 2', 7_500_000, 7.2, 120, { matchStatus: 'starting' }),
  mkPlayer('Samuel Gachuhi',    'Nakuru', 'Number 8',  'Tier 3', 5_500_000, 6.6, 103, { matchStatus: 'bench' }),
  mkPlayer('Peter Kiprotich',   'Nakuru', 'Fly-half',  'Tier 3', 5_500_000, 6.3, 96,  { matchStatus: 'starting' }),
  mkPlayer('Martin Njagi',      'Nakuru', 'Wing',      'Tier 4', 3_500_000, 5.1, 65,  { matchStatus: 'starting' }),

  // ── Daystar Falcons (4 players) ───────────────────────────────────────────
  mkPlayer('Robert Kimani',     'Daystar Falcons', 'Hooker',    'Tier 3', 5_500_000, 6.5, 100, { matchStatus: 'starting' }),
  mkPlayer('Emmanuel Wekesa',   'Daystar Falcons', 'Prop',      'Tier 3', 5_500_000, 6.1, 93,  { matchStatus: 'starting' }),
  mkPlayer('Dennis Kuria',      'Daystar Falcons', 'Center',    'Tier 4', 3_500_000, 5.0, 63,  { matchStatus: 'bench' }),
  mkPlayer('Anthony Njoroge',   'Daystar Falcons', 'Full-back', 'Tier 4', 3_500_000, 4.8, 58,  { matchStatus: 'starting' }),

  // ── Impala (4 players) ────────────────────────────────────────────────────
  mkPlayer('Kevin Mwenda',      'Impala', 'Lock',       'Tier 2', 7_500_000, 7.4, 126, { matchStatus: 'starting' }),
  mkPlayer('Raymond Otieno',    'Impala', 'Flanker',    'Tier 3', 5_500_000, 6.6, 105, { matchStatus: 'bench' }),
  mkPlayer('Felix Ochieng',     'Impala', 'Scrum-half', 'Tier 3', 5_500_000, 6.4, 99,  { matchStatus: 'starting' }),
  mkPlayer('Denis Maina',       'Impala', 'Wing',       'Tier 4', 3_500_000, 5.3, 70,  { matchStatus: 'starting' }),

  // ── Mwamba (4 players) ────────────────────────────────────────────────────
  mkPlayer('Eric Ogweno',       'Mwamba', 'Number 8',   'Tier 2', 7_500_000, 7.6, 132, { matchStatus: 'starting' }),
  mkPlayer('Victor Ombati',     'Mwamba', 'Prop',       'Tier 3', 5_500_000, 6.3, 97,  { matchStatus: 'bench' }),
  mkPlayer('Caleb Otieno',      'Mwamba', 'Center',     'Tier 3', 5_500_000, 6.1, 94,  { matchStatus: 'starting' }),
  mkPlayer('James Mutuku',      'Mwamba', 'Fly-half',   'Tier 4', 3_500_000, 5.0, 62,  { matchStatus: 'starting' }),

  // ── JKUAT Cougars (4 players) ─────────────────────────────────────────────
  mkPlayer('Nelson Ochieng',    'JKUAT Cougars', 'Hooker',    'Tier 3', 5_500_000, 6.4, 98, { matchStatus: 'starting' }),
  mkPlayer('Timothy Korir',     'JKUAT Cougars', 'Lock',      'Tier 3', 5_500_000, 6.2, 95, { matchStatus: 'starting' }),
  mkPlayer('Brian Kiprotich',   'JKUAT Cougars', 'Flanker',   'Tier 4', 3_500_000, 5.1, 66, { matchStatus: 'bench' }),
  mkPlayer('Steven Njoroge',    'JKUAT Cougars', 'Full-back', 'Tier 4', 3_500_000, 4.7, 55, { matchStatus: 'suspended', isSuspended: true }),
];

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES – Gameweek 4, Season 26/27
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_FIXTURES: Fixture[] = [
  { id: 'f1', gameweek: 4, homeClub: 'Kabras Sugar', awayClub: 'KCB Rugby',       kickoffTime: '2026-10-03T14:00:00+03:00', venue: 'Kakamega RFC Ground',   status: 'scheduled' },
  { id: 'f2', gameweek: 4, homeClub: 'Menengai Oilers', awayClub: 'Kenya Harlequin', kickoffTime: '2026-10-03T14:00:00+03:00', venue: 'Nakuru Athletic Club',   status: 'scheduled' },
  { id: 'f3', gameweek: 4, homeClub: 'Strathmore Leos', awayClub: 'Nondescripts',    kickoffTime: '2026-10-03T16:30:00+03:00', venue: 'Strathmore University',  status: 'scheduled' },
  { id: 'f4', gameweek: 4, homeClub: 'KU Blak Blad', awayClub: 'Nakuru',           kickoffTime: '2026-10-04T14:00:00+03:00', venue: 'Kenyatta University',    status: 'scheduled' },
  { id: 'f5', gameweek: 4, homeClub: 'Impala', awayClub: 'Mwamba',             kickoffTime: '2026-10-04T14:00:00+03:00', venue: 'Impala Club Nairobi',    status: 'scheduled' },
  { id: 'f6', gameweek: 4, homeClub: 'Daystar Falcons', awayClub: 'JKUAT Cougars',   kickoffTime: '2026-10-04T16:30:00+03:00', venue: 'Daystar University',     status: 'scheduled' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GAMEWEEKS
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_GAMEWEEKS: Gameweek[] = [
  { id: 1, season: '26/27', number: 1, name: 'Round 1', startDate: '2026-09-05', endDate: '2026-09-07', status: 'completed', deadlineTime: '2026-09-04T18:00:00+03:00' },
  { id: 2, season: '26/27', number: 2, name: 'Round 2', startDate: '2026-09-12', endDate: '2026-09-14', status: 'completed', deadlineTime: '2026-09-11T18:00:00+03:00' },
  { id: 3, season: '26/27', number: 3, name: 'Round 3', startDate: '2026-09-19', endDate: '2026-09-21', status: 'completed', deadlineTime: '2026-09-18T18:00:00+03:00' },
  { id: 4, season: '26/27', number: 4, name: 'Round 4', startDate: '2026-10-03', endDate: '2026-10-05', status: 'active',    deadlineTime: '2026-10-02T18:00:00+03:00' },
  { id: 5, season: '26/27', number: 5, name: 'Round 5', startDate: '2026-10-10', endDate: '2026-10-12', status: 'upcoming', deadlineTime: '2026-10-09T18:00:00+03:00' },
  { id: 6, season: '26/27', number: 6, name: 'Round 6', startDate: '2026-10-17', endDate: '2026-10-19', status: 'upcoming', deadlineTime: '2026-10-16T18:00:00+03:00' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CURRENT GAMEWEEK
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENT_GAMEWEEK = MOCK_GAMEWEEKS.find(gw => gw.status === 'active')!;

// ─────────────────────────────────────────────────────────────────────────────
// CLUB COLORS & ABBREVIATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const CLUB_META: Record<string, { abbr: string; color: string; bg: string }> = {
  'Kabras Sugar':    { abbr: 'KBS', color: '#10B981', bg: '#064E3B' },
  'KCB Rugby':       { abbr: 'KCB', color: '#3B82F6', bg: '#1E3A5F' },
  'Menengai Oilers': { abbr: 'MNO', color: '#F59E0B', bg: '#451A03' },
  'Kenya Harlequin': { abbr: 'HQN', color: '#EC4899', bg: '#500724' },
  'Strathmore Leos': { abbr: 'STR', color: '#8B5CF6', bg: '#2E1065' },
  'KU Blak Blad':    { abbr: 'KUB', color: '#EF4444', bg: '#450A0A' },
  'Nondescripts':    { abbr: 'NDX', color: '#06B6D4', bg: '#083344' },
  'Nakuru':          { abbr: 'NAK', color: '#F97316', bg: '#431407' },
  'Daystar Falcons': { abbr: 'DAY', color: '#84CC16', bg: '#1A2E05' },
  'Impala':          { abbr: 'IMP', color: '#14B8A6', bg: '#042F2E' },
  'Mwamba':          { abbr: 'MWA', color: '#A855F7', bg: '#3B0764' },
  'JKUAT Cougars':   { abbr: 'JKU', color: '#F43F5E', bg: '#4C0519' },
};

// ─────────────────────────────────────────────────────────────────────────────
// POSITION DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const POSITION_ABBR: Record<string, string> = {
  'Prop': 'PR', 'Hooker': 'HK', 'Lock': 'LK', 'Flanker': 'FL',
  'Number 8': 'N8', 'Scrum-half': 'SH', 'Fly-half': 'FH',
  'Center': 'CTR', 'Wing': 'WG', 'Full-back': 'FB',
};

// Pitch layout slots: slot index → { row, col, label }
export const PITCH_SLOTS = [
  // Forwards (1–8)
  { slot: 1, label: 'Prop',     row: 0, col: 0 },
  { slot: 2, label: 'Hooker',   row: 0, col: 1 },
  { slot: 3, label: 'Prop',     row: 0, col: 2 },
  { slot: 4, label: 'Lock',     row: 1, col: 0 },
  { slot: 5, label: 'Lock',     row: 1, col: 2 },
  { slot: 6, label: 'Flanker',  row: 2, col: 0 },
  { slot: 7, label: 'Number 8', row: 2, col: 1 },
  { slot: 8, label: 'Flanker',  row: 2, col: 2 },
  // Backs (9–15)
  { slot: 9,  label: 'Scrum-half', row: 3, col: 1 },
  { slot: 10, label: 'Fly-half',   row: 4, col: 1 },
  { slot: 11, label: 'Wing',       row: 5, col: 0 },
  { slot: 12, label: 'Center',     row: 5, col: 1 },
  { slot: 13, label: 'Center',     row: 5, col: 2 },
  { slot: 14, label: 'Wing',       row: 6, col: 0 },
  { slot: 15, label: 'Full-back',  row: 6, col: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK LEAGUE STANDINGS
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_LEAGUE_MEMBERS = [
  { userId: 'u1', teamName: 'Savannah Slayers',    totalPoints: 612, rank: 1, previousRank: 2, rankChange:  1, gameweekPoints: 78 },
  { userId: 'u2', teamName: 'Nairobi Night Owls',  totalPoints: 598, rank: 2, previousRank: 1, rankChange: -1, gameweekPoints: 71 },
  { userId: 'u3', teamName: 'Rift Valley Raptors', totalPoints: 581, rank: 3, previousRank: 3, rankChange:  0, gameweekPoints: 65 },
  { userId: 'u4', teamName: 'Lake Victoria FC',    totalPoints: 560, rank: 4, previousRank: 5, rankChange:  1, gameweekPoints: 82 },
  { userId: 'u5', teamName: 'Coastal Raiders',     totalPoints: 547, rank: 5, previousRank: 4, rankChange: -1, gameweekPoints: 58 },
  { userId: 'me', teamName: 'My Fantasy XV',        totalPoints: 534, rank: 6, previousRank: 8, rankChange:  2, gameweekPoints: 74 },
  { userId: 'u6', teamName: 'Highlands Heroes',    totalPoints: 521, rank: 7, previousRank: 6, rankChange: -1, gameweekPoints: 61 },
  { userId: 'u7', teamName: 'Mombasa Pirates',     totalPoints: 508, rank: 8, previousRank: 7, rankChange: -1, gameweekPoints: 53 },
];
