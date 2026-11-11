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
  const isFrontRow =
    position === 'Loosehead Prop' ||
    position === 'Tighthead Prop' ||
    position === 'Hooker' ||
    position === 'Front Row' ||
    (position as string) === 'Prop';

  const isHooker = position === 'Hooker';

  const isJumper =
    position === 'Lock' ||
    position === 'Blindside Flanker' ||
    position === 'Openside Flanker' ||
    position === 'Number 8' ||
    position === 'Back Row' ||
    (position as string) === 'Flanker' ||
    extra?.isJumper === true;

  const isForward = isFrontRow || isJumper;
  const positionGroup: PositionGroup = isForward ? 'Forward' : 'Back';

  // Kickoff times spread across Kenya Cup Matchday 1 (November 21, 2026)
  const kickoffTimes = [
    '2026-11-21T14:00:00+03:00',
    '2026-11-21T15:00:00+03:00',
    '2026-11-21T16:00:00+03:00',
    '2026-11-21T16:30:00+03:00',
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
    isJumper,
    isHooker,
    isFrontRow,
    is_jumper: isJumper,
    is_hooker: isHooker,
    is_front_row: isFrontRow,
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
  mkPlayer('Brian Juma',        'Kabras Sugar', 'Prop',       'Tier 1', 10_000_000, 9.2, 187, { matchStatus: 'starting', headshot_url: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793957845/kenya-cup/headshots/fb3henlmelcq4wpb6lks.avif' }),
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
// FIXTURES – Kenya Cup Matchday 1 (November 21, 2026)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_FIXTURES: Fixture[] = [
  { id: '44b848f1-d645-47fb-8895-6d0ad28477a9', gameweek: 1, homeClub: 'Mwamba', awayClub: 'KU Blak Blad', kickoffTime: '2026-11-21T09:00:00+03:00', venue: 'Goan Institute Sports Grounds', status: 'scheduled' },
  { id: 'acf7134d-b435-47cc-9535-20e00de3ec76', gameweek: 1, homeClub: 'Kabras Sugar', awayClub: 'KCB Rugby', kickoffTime: '2026-11-21T12:00:00+03:00', venue: 'Kakamega RFC', status: 'scheduled' },
  { id: 'eee8e565-71c3-4f22-aeff-62d8fbc52c4a', gameweek: 1, homeClub: 'JKUAT Cougars', awayClub: 'Nakuru', kickoffTime: '2026-11-21T12:00:00+03:00', venue: 'JKUAT', status: 'scheduled' },
  { id: '0ee1772c-8a7c-4c8e-8412-f8dd747e1b89', gameweek: 1, homeClub: 'Daystar Falcons', awayClub: 'Menengai Oilers', kickoffTime: '2026-11-21T12:00:00+03:00', venue: 'Daystar University', status: 'scheduled' },
  { id: 'deb1d570-f96b-4ac0-8129-40376da1b618', gameweek: 1, homeClub: 'Kenya Harlequin', awayClub: 'Strathmore Leos', kickoffTime: '2026-11-21T12:00:00+03:00', venue: 'RFUEA Ground', status: 'scheduled' },
  { id: '100922c0-7f80-4119-94f7-6bbcc0b38174', gameweek: 1, homeClub: 'Impala', awayClub: 'Nondescripts', kickoffTime: '2026-11-21T12:00:00+03:00', venue: 'Impala Grounds', status: 'scheduled' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GAMEWEEKS
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_GAMEWEEKS: Gameweek[] = [
  { id: 1, season: '26/27', number: 1, name: 'Round 1', startDate: '2026-11-21', endDate: '2026-11-21', status: 'active', deadlineTime: '2026-11-21T08:00:00+03:00' },
  { id: 2, season: '26/27', number: 2, name: 'Round 2', startDate: '2026-11-28', endDate: '2026-11-28', status: 'upcoming', deadlineTime: '2026-11-28T14:00:00+03:00' },
  { id: 3, season: '26/27', number: 3, name: 'Round 3', startDate: '2026-12-05', endDate: '2026-12-05', status: 'upcoming', deadlineTime: '2026-12-05T14:00:00+03:00' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CURRENT GAMEWEEK
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENT_GAMEWEEK = MOCK_GAMEWEEKS.find(gw => gw.status === 'active')!;

// ─────────────────────────────────────────────────────────────────────────────
// CLUB COLORS, ABBREVIATIONS & CLOUDINARY LOGOS
// ─────────────────────────────────────────────────────────────────────────────
export const CLUB_META: Record<string, { abbr: string; color: string; bg: string; logo?: string }> = {
  'Kabras Sugar':    { abbr: 'KBS', color: '#16a34a', bg: '#064E3B', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793961532/kenya-cup/logos/pjdrbuq9wnbiqzf3ckni.png' },
  'KCB Rugby':       { abbr: 'KCB', color: '#2ec27e', bg: '#1E3A5F', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793961557/kenya-cup/logos/jpfjllflre1housszipi.webp' },
  'Menengai Oilers': { abbr: 'MNO', color: '#7c3aed', bg: '#451A03', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960174/kenya-cup/logos/giki6nzcpp9pqbkczwon.jpg' },
  'Kenya Harlequin': { abbr: 'HQN', color: '#c01c28', bg: '#500724', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960338/kenya-cup/logos/tg2wwgrtelgmwkhov3if.png' },
  'Strathmore Leos': { abbr: 'STR', color: '#1c71d8', bg: '#2E1065', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960755/kenya-cup/logos/zmdkxfbmlmmp55iwihyz.png' },
  'KU Blak Blad':    { abbr: 'KUB', color: '#c01c28', bg: '#450A0A', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793961181/kenya-cup/logos/ivn0cguxnrrctd5cykvt.jpg' },
  'Nondescripts':    { abbr: 'NDX', color: '#b45309', bg: '#083344', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960450/kenya-cup/logos/gt4uv9n2afy2m8g2dfvo.svg' },
  'Nakuru':          { abbr: 'NAK', color: '#0284c7', bg: '#431407', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960133/kenya-cup/logos/a2bylshrzscl56fqmsnn.jpg' },
  'Daystar Falcons': { abbr: 'DAY', color: '#7c2d12', bg: '#1A2E05', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960232/kenya-cup/logos/ixmamslsjqecnsh2sznf.jpg' },
  'Impala':          { abbr: 'IMP', color: '#000000', bg: '#042F2E', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960978/kenya-cup/logos/kjd5eljftyei24t5jqpe.jpg' },
  'Mwamba':          { abbr: 'MWA', color: '#000000', bg: '#3B0764', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793960077/kenya-cup/logos/gvqd6m675nx5g53qhmvn.jpg' },
  'JKUAT Cougars':   { abbr: 'JKU', color: '#ffffff', bg: '#4C0519', logo: 'https://res.cloudinary.com/dsidwfnbw/image/upload/v1793961362/kenya-cup/logos/jmfq64xb8dhs8e0jl5py.jpg' },
};

// ─────────────────────────────────────────────────────────────────────────────
// POSITION DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const POSITION_ABBR: Record<string, string> = {
  // Granular Rugby Union Positions
  'Loosehead Prop': 'LHP',
  'Hooker': 'HK',
  'Tighthead Prop': 'THP',
  'Lock': 'LK',
  'Blindside Flanker': 'BSF',
  'Openside Flanker': 'OSF',
  'Number 8': 'N8',
  'Scrum-half': 'SH',
  'Fly-half': 'FH',
  'Inside Center': 'IC',
  'Outside Center': 'OC',
  'Left Wing': 'LW',
  'Right Wing': 'RW',
  'Fullback': 'FB',
  'Utility Back': 'UB',
  'Front Row': 'FR',
  'Back Row': 'BR',
  // Legacy designations
  'Prop': 'PR',
  'Flanker': 'FL',
  'Center': 'CTR',
  'Wing': 'WG',
  'Full-back': 'FB',
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
