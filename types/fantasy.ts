// ─────────────────────────────────────────────────────────────────────────────
// Kenya Cup Fantasy Rugby – Core Type Definitions (Season 26/27)
// Designed to match Supabase / PostgreSQL table schemas
// ─────────────────────────────────────────────────────────────────────────────

export type RugbyPosition =
  // The Tight Five
  | 'Loosehead Prop'
  | 'Hooker'
  | 'Tighthead Prop'
  | 'Lock'
  // The Back Row
  | 'Blindside Flanker'
  | 'Openside Flanker'
  | 'Number 8'
  // The Halfbacks
  | 'Scrum-half'
  | 'Fly-half'
  // The Midfield & Outside Backs
  | 'Inside Center'
  | 'Outside Center'
  | 'Left Wing'
  | 'Right Wing'
  | 'Fullback'
  // Utility & Broad Roster Designations
  | 'Utility Back'
  | 'Front Row'
  | 'Back Row';

export type LegacyPosition =
  | 'Prop'
  | 'Flanker'
  | 'Center'
  | 'Wing'
  | 'Full-back';

export type Position = RugbyPosition | LegacyPosition;

export const RUGBY_POSITIONS: RugbyPosition[] = [
  'Loosehead Prop',
  'Hooker',
  'Tighthead Prop',
  'Lock',
  'Blindside Flanker',
  'Openside Flanker',
  'Number 8',
  'Scrum-half',
  'Fly-half',
  'Inside Center',
  'Outside Center',
  'Left Wing',
  'Right Wing',
  'Fullback',
  'Utility Back',
  'Front Row',
  'Back Row',
];

export type Tier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';

// Kept as string union for mock data backward-compat.
// Production players reference clubs via club_id (FK to clubs table).
export type Club =
  | 'Kabras Sugar'
  | 'KCB Rugby'
  | 'Menengai Oilers'
  | 'Kenya Harlequin'
  | 'Strathmore Leos'
  | 'KU Blak Blad'
  | 'Nondescripts'
  | 'Nakuru'
  | 'Daystar Falcons'
  | 'Impala'
  | 'Mwamba'
  | 'JKUAT Cougars';

// ─── ClubRecord (dynamic clubs table) ────────────────────────────────────────────────
export interface ClubRecord {
  id: string;
  name: string;
  abbreviation: string;          // e.g. 'KBS'
  logo_url?: string | null;      // Cloudinary: kenya-cup/logos
  primary_color: string;
  secondary_color: string;
  home_ground?: string | null;
  is_active_in_kenya_cup: boolean;
  founded_year?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type PositionGroup = 'Forward' | 'Back';
export type MatchStatus = 'starting' | 'bench' | 'injured' | 'suspended';
export type BoosterType = 'triple' | 'limit' | 'co' | 'bench' | 'BENCH_BOOST';
export type RosterStatus = 'STARTER' | 'BENCH';

export interface Booster {
  id: BoosterType;
  label: string;
  short: string;
  color: string;
  bg: string;
  description: string;
}

// ─── Player ──────────────────────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  club: Club;       // legacy string for mock data
  club_id?: string; // FK → clubs.id in production
  position: Position;
  positionGroup: PositionGroup;
  isJumper: boolean;
  isHooker: boolean;
  isFrontRow: boolean;
  is_jumper?: boolean;
  is_hooker?: boolean;
  is_front_row?: boolean;
  tier: Tier;
  cost: number;
  matchKickoffTime: string;
  stats?: PlayerStats;
  form: number;
  totalPoints: number;
  /** @deprecated use headshot_url */
  image?: string;
  headshot_url?: string | null;  // Cloudinary URL
  isInjured: boolean;
  isSuspended: boolean;
  isActive: boolean;             // false = soft-deleted
  matchStatus?: MatchStatus;     // 'starting' | 'bench' | 'injured' | 'suspended'
  previous_cost?: number;        // Dynamic pricing: prior gameweek cost
  form_rating?: number;          // Dynamic pricing: 3-match weighted form
  clubs?: {
    id: string;
    name: string;
    logo_url?: string | null;
    abbreviation?: string;
    primary_color?: string;
  } | null;
  club_logo_url?: string | null;
}

// ─── Admin User ───────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  teamName: string;
  is_admin: boolean;
}

// ─── Match Event Data (Unified Legacy & Overhauled Kenya Cup Scoring) ────────
export interface MatchEventData {
  // --- EXISTING STATS (DO NOT REMOVE) ---
  minutesPlayed: number;
  tries: number;
  tryAssists: number;
  conversions: number;
  penaltyGoals: number;
  dropGoals: number;
  tackles: number;
  carries: number;
  lineoutsWon: number;
  lineoutsLost: number;
  scrumsWon: number;
  scrumsLost: number;
  yellowCards: number;
  redCards: number;

  // --- NEWLY ADDED STATS ---
  // Appearance & Result
  isStartingPlayer: boolean;
  isSubstitute: boolean;
  teamWon: boolean;
  teamDraw: boolean;

  // Scoring
  penaltyKicksMissed: number;

  // Team Gameplay (Forwards Only)
  forwardsScrumsWon100: boolean;
  forwardsScrumsWonOpponent: number;
  forwardsLineoutsWon90: boolean;
  forwardsLineoutsStolen20: boolean;

  // Individual Gameplay
  metresCarried: number; // New specific metric for ball carrying
  cleanBreaks: number;
  defendersBeaten: number;
  turnoversWon: number;
  lineoutsStolenIndividual: number;
  missedTackles: number;
  handlingErrors: number;
  penaltiesConceded: number;
  kicks50_22: number;
  playerOfTheMatch: boolean;

  // Backward-compatibility singular aliases
  scrumWon?: number;
  scrumLost?: number;
}

// ─── Match Event (Tisini stat entry) ─────────────────────────────────────────
export interface MatchEvent extends MatchEventData {
  id: string;
  playerId: string;
  fixtureId: string;
  gameweek: number;
  isPostponed?: boolean;
  enteredByAdminId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerStats extends Partial<MatchEventData> {
  playerId: string;
  gameweek: number;
  minutesPlayed: number;
  tries: number;
  tryAssists: number;
  conversions: number;
  penaltyGoals: number;
  dropGoals: number;
  tackles: number;
  carries: number;
  lineoutsWon: number;
  lineoutsLost: number;
  scrumWon?: number;
  scrumLost?: number;
  scrumsWon?: number;
  scrumsLost?: number;
  yellowCards: number;
  redCards: number;
  points: number;

  // ── Overhauled Scoring Matrix Fields & Aliases ──────────────────────────────
  isStarter?: boolean;
  isSubstitute?: boolean;
  isStartingPlayer?: boolean;
  teamResult?: 'win' | 'draw' | 'loss' | null;
  teamWon?: boolean;
  teamDraw?: boolean;
  penaltyKicksMissed?: number;

  // Forward Set-Piece Mastery (Exclusively Forwards)
  isForward?: boolean;
  position?: Position;
  forwardsScrumsWon100?: boolean;
  forwardsScrumsWonOpponent?: number;
  forwardsLineoutsWon90?: boolean;
  forwardsLineoutsStolen20?: boolean;
  ownScrumsWonPercent?: number;          // 100% = +2.0
  scrumsWonOnOpponentPutIn?: number;     // +1.0 per scrum
  ownLineoutsWonPercent?: number;        // 90%+ = +2.0
  oppositionLineoutsWonPercent?: number; // 20%+ = +1.0

  // Individual Gameplay
  metresCarried?: number;                // +0.5 per 5 metres
  cleanBreaks?: number;                  // +1.0 each
  defendersBeaten?: number;              // +1.0 per 2 defenders
  turnoversWon?: number;                 // +1.0 each
  lineoutsStolenIndividual?: number;     // +1.0 each
  oppositionLineoutSteals?: number;      // +1.0 each
  missedTackles?: number;                // -0.5 each
  handlingErrors?: number;               // -0.5 each
  penaltiesConceded?: number;            // -1.0 each
  kicks50_22?: number;                   // +2.0 each
  playerOfTheMatch?: boolean;            // +3.0
  isPlayerOfTheMatch?: boolean;          // +3.0
}

export interface ScoringRules {
  try: number;
  tryAssist: number;
  conversion: number;
  penaltyGoal: number;
  dropGoal: number;
  tackle: number;
  carry: number;
  lineoutWon: number;
  lineoutLost: number;
  scrumWon: number;
  scrumLost: number;
  yellowCard: number;
  redCard: number;
  minutesPlayed60Plus: number;
  minutesPlayed30Plus: number;

  // Overhauled matrix rates
  startingPlayer: number;
  substitutePlayer: number;
  teamWin: number;
  teamDraw: number;
  penaltyKickMissed: number;
  forwardScrum100Pct: number;
  forwardScrumOpponentPutIn: number;
  forwardLineout90Pct: number;
  forwardLineoutOpponent20Pct: number;
  cleanBreak: number;
  turnoverWon: number;
  oppositionLineoutSteal: number;
  missedTackle: number;
  handlingError: number;
  penaltyConceded: number;
  kick50_22: number;
  playerOfTheMatch: number;
}

export interface Squad {
  id: string;
  userId: string;
  gameweek: number;
  budget: number;
  totalBudget: number;
  players: SquadPlayer[];
  captainId: string | null;
  viceCaptainId: string | null;
  activeBooster?: BoosterType | null;
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  totalPoints?: number;
}

export interface SquadConstraints {
  totalPlayers: number;
  maxPerClub: number;
  totalBudget: number;
  starterCount: number;
  benchCount: number;
}

export interface SquadPlayer {
  playerId: string;
  player: Player;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isLocked: boolean;
  pitchSlot: number;
  rosterStatus: RosterStatus;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface Gameweek {
  id: number;
  season: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  deadlineTime: string;
}

export interface Fixture {
  id: string;
  gameweek: number;
  homeClub: Club;
  awayClub: Club;
  kickoffTime: string;
  venue: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'completed';
}

export interface League {
  id: string;
  name: string;
  code: string;
  adminId: string;
  type: 'public' | 'private';
  season: string;
  members: LeagueMember[];
  createdAt: string;
}

export interface LeagueMember {
  userId: string;
  teamName: string;
  totalPoints: number;
  rank: number;
  previousRank: number;
  rankChange: number;
  gameweekPoints: number;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}

export interface FantasyUser {
  id: string;
  email: string;
  teamName: string;
  username?: string;
  is_admin: boolean;
  avatarUrl?: string;
  avatar_url?: string;
  overallPoints: number;
  overallRank: number;
  gameweekPoints: number;
  gameweekRank: number;
  season: string;
  createdAt?: string;
  created_at?: string;
}

export interface Transfer {
  id: string;
  userId: string;
  gameweek: number;
  playerInId: string;
  playerOutId: string;
  transferredAt: string;
}

export interface GenericRelationship {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}

export type Database = {
  public: {
    Tables: {
      players: {
        Row: Omit<Player, 'stats'>;
        Insert: Omit<Player, 'id' | 'stats'>;
        Update: Partial<Omit<Player, 'id' | 'stats'>>;
        Relationships: GenericRelationship[];
      };
      squads: {
        Row: Omit<Squad, 'players'>;
        Insert: Omit<Squad, 'id' | 'createdAt' | 'updatedAt' | 'players'>;
        Update: Partial<Omit<Squad, 'id' | 'players'>>;
        Relationships: GenericRelationship[];
      };
      fixtures: {
        Row: { [K in keyof Fixture]: Fixture[K] };
        Insert: Omit<Fixture, 'id'>;
        Update: Partial<Omit<Fixture, 'id'>>;
        Relationships: GenericRelationship[];
      };
      leagues: {
        Row: Omit<League, 'members'>;
        Insert: Omit<League, 'id' | 'createdAt' | 'members'>;
        Update: Partial<Omit<League, 'id' | 'members'>>;
        Relationships: GenericRelationship[];
      };
      player_stats: {
        Row: { [K in keyof PlayerStats]: PlayerStats[K] };
        Insert: Omit<PlayerStats, 'points'>;
        Update: Partial<PlayerStats>;
        Relationships: GenericRelationship[];
      };
      fantasy_users: {
        Row: { [K in keyof FantasyUser]: FantasyUser[K] };
        Insert: Partial<FantasyUser> & { id: string; email: string; teamName: string };
        Update: Partial<FantasyUser>;
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ─── Cloudinary Upload Widget Type Definitions ───────────────────────────────
export interface CloudinaryUploadResultInfo {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface CloudinaryUploadResult {
  event: string;
  info: CloudinaryUploadResultInfo;
}

export interface CloudinaryWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  cropping?: boolean;
  croppingAspectRatio?: number;
  maxFiles?: number;
  resourceType?: string;
  sources?: string[];
}

export interface CloudinaryWidget {
  open: () => void;
  close: () => void;
}

export interface CloudinaryGlobal {
  createUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: (error: unknown, result: CloudinaryUploadResult) => void
  ) => CloudinaryWidget;
}

declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

