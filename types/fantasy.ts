// ─────────────────────────────────────────────────────────────────────────────
// Kenya Cup Fantasy Rugby – Core Type Definitions (Season 26/27)
// Designed to match Supabase / PostgreSQL table schemas
// ─────────────────────────────────────────────────────────────────────────────

export type Position =
  | 'Prop'
  | 'Hooker'
  | 'Lock'
  | 'Flanker'
  | 'Number 8'
  | 'Scrum-half'
  | 'Fly-half'
  | 'Center'
  | 'Wing'
  | 'Full-back';

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
}

// ─── Admin User ───────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  teamName: string;
  is_admin: boolean;
}

// ─── Match Event (Tisini stat entry) ─────────────────────────────────────────
export interface MatchEvent {
  id: string;
  playerId: string;
  fixtureId: string;
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
  scrumWon: number;
  scrumLost: number;
  yellowCards: number;
  redCards: number;
  isPostponed: boolean;
  enteredByAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
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
  scrumWon: number;
  scrumLost: number;
  yellowCards: number;
  redCards: number;
  points: number;
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
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  totalPoints?: number;
}

export interface SquadConstraints {
  totalPlayers: number;
  maxPerClub: number;
  totalBudget: number;
}

export interface SquadPlayer {
  playerId: string;
  player: Player;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isLocked: boolean;
  pitchSlot: number;
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
}

export interface FantasyUser {
  id: string;
  email: string;
  teamName: string;
  username?: string;
  is_admin: boolean;
  avatarUrl?: string;
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

