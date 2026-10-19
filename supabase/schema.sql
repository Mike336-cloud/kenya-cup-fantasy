-- ─────────────────────────────────────────────────────────────────────────────
-- Kenya Cup Fantasy Rugby – Supabase PostgreSQL Schema
-- Season 26/27
-- Run this in your Supabase SQL editor to create all tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── players ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  club               TEXT NOT NULL CHECK (club IN (
    'Kabras Sugar', 'KCB Rugby', 'Menengai Oilers', 'Kenya Harlequin',
    'Strathmore Leos', 'KU Blak Blad', 'Nondescripts', 'Nakuru',
    'Daystar Falcons', 'Impala', 'Mwamba', 'JKUAT Cougars'
  )),
  position           TEXT NOT NULL CHECK (position IN (
    'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8',
    'Scrum-half', 'Fly-half', 'Center', 'Wing', 'Full-back'
  )),
  "positionGroup"    TEXT NOT NULL CHECK ("positionGroup" IN ('Forward', 'Back')),
  "isJumper"         BOOLEAN NOT NULL DEFAULT false,
  "isHooker"         BOOLEAN NOT NULL DEFAULT false,
  "isFrontRow"       BOOLEAN NOT NULL DEFAULT false,
  tier               TEXT NOT NULL CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3', 'Tier 4')),
  cost               INTEGER NOT NULL,  -- in KES (e.g. 10000000)
  "matchKickoffTime" TIMESTAMPTZ NOT NULL,
  form               NUMERIC(3,1) NOT NULL DEFAULT 0,
  "totalPoints"      INTEGER NOT NULL DEFAULT 0,
  image              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── player_stats ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_stats (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "playerId"       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  gameweek         INTEGER NOT NULL,
  "minutesPlayed"  INTEGER NOT NULL DEFAULT 0,
  tries            INTEGER NOT NULL DEFAULT 0,
  "tryAssists"     INTEGER NOT NULL DEFAULT 0,
  conversions      INTEGER NOT NULL DEFAULT 0,
  "penaltyGoals"   INTEGER NOT NULL DEFAULT 0,
  "dropGoals"      INTEGER NOT NULL DEFAULT 0,
  tackles          INTEGER NOT NULL DEFAULT 0,
  carries          INTEGER NOT NULL DEFAULT 0,
  "lineoutsWon"    INTEGER NOT NULL DEFAULT 0,
  "lineoutsLost"   INTEGER NOT NULL DEFAULT 0,
  "scrumWon"       INTEGER NOT NULL DEFAULT 0,
  "scrumLost"      INTEGER NOT NULL DEFAULT 0,
  "yellowCards"    INTEGER NOT NULL DEFAULT 0,
  "redCards"       INTEGER NOT NULL DEFAULT 0,
  points           INTEGER GENERATED ALWAYS AS (
    -- Appearance
    CASE WHEN "minutesPlayed" >= 60 THEN 2
         WHEN "minutesPlayed" >= 30 THEN 1
         ELSE 0 END
    -- Scoring events
    + (tries * 5)
    + ("tryAssists" * 3)
    + (conversions * 2)
    + ("penaltyGoals" * 3)
    + ("dropGoals" * 3)
    -- Discipline
    + ("yellowCards" * -3)
    + ("redCards" * -5)
  ) STORED,
  UNIQUE ("playerId", gameweek)
);

-- ── fixtures ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fixtures (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gameweek         INTEGER NOT NULL,
  "homeClub"       TEXT NOT NULL,
  "awayClub"       TEXT NOT NULL,
  "kickoffTime"    TIMESTAMPTZ NOT NULL,
  venue            TEXT NOT NULL,
  "homeScore"      INTEGER,
  "awayScore"      INTEGER,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled', 'live', 'completed')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── users / fantasy teams ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fantasy_users (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT NOT NULL UNIQUE,
  "teamName"       TEXT NOT NULL,
  "avatarUrl"      TEXT,
  "overallPoints"  INTEGER NOT NULL DEFAULT 0,
  "overallRank"    INTEGER,
  "gameweekPoints" INTEGER NOT NULL DEFAULT 0,
  "gameweekRank"   INTEGER,
  season           TEXT NOT NULL DEFAULT '26/27',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── squads ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS squads (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"         UUID NOT NULL REFERENCES fantasy_users(id) ON DELETE CASCADE,
  gameweek         INTEGER NOT NULL,
  "totalBudget"    INTEGER NOT NULL DEFAULT 100000000,
  "captainId"      UUID REFERENCES players(id),
  "viceCaptainId"  UUID REFERENCES players(id),
  "isLocked"       BOOLEAN NOT NULL DEFAULT false,
  "totalPoints"    INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("userId", gameweek)
);

-- ── squad_players ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS squad_players (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "squadId"        UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  "playerId"       UUID NOT NULL REFERENCES players(id),
  "isCaptain"      BOOLEAN NOT NULL DEFAULT false,
  "isViceCaptain"  BOOLEAN NOT NULL DEFAULT false,
  "pitchSlot"      INTEGER NOT NULL CHECK ("pitchSlot" BETWEEN 1 AND 15),
  UNIQUE ("squadId", "playerId"),
  UNIQUE ("squadId", "pitchSlot")
);

-- ── leagues ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leagues (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  code             TEXT NOT NULL UNIQUE,  -- 6-char invite code
  "adminId"        UUID NOT NULL REFERENCES fantasy_users(id),
  type             TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('public', 'private')),
  season           TEXT NOT NULL DEFAULT '26/27',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── league_members ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_members (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "leagueId"       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  "userId"         UUID NOT NULL REFERENCES fantasy_users(id),
  rank             INTEGER,
  "previousRank"   INTEGER,
  "rankChange"     INTEGER GENERATED ALWAYS AS (
    COALESCE("previousRank", rank) - rank
  ) STORED,
  joined_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("leagueId", "userId")
);

-- ── Row-level security (RLS) ──────────────────────────────────────────────────
ALTER TABLE players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_players   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members  ENABLE ROW LEVEL SECURITY;

-- Public read access on players, fixtures
CREATE POLICY "Players are publicly readable" ON players FOR SELECT USING (true);
CREATE POLICY "Fixtures are publicly readable" ON fixtures FOR SELECT USING (true);
CREATE POLICY "Stats are publicly readable" ON player_stats FOR SELECT USING (true);

-- Users can only read/update their own profile
CREATE POLICY "Users read own profile" ON fantasy_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON fantasy_users FOR UPDATE USING (auth.uid() = id);

-- Squads are private to their owner
CREATE POLICY "Users manage own squad" ON squads FOR ALL USING (auth.uid() = "userId");
CREATE POLICY "Users manage own squad_players" ON squad_players FOR ALL
  USING (EXISTS (SELECT 1 FROM squads WHERE squads.id = squad_players."squadId" AND squads."userId" = auth.uid()));

-- League members can view their leagues
CREATE POLICY "League members view league" ON leagues FOR SELECT
  USING (type = 'public' OR EXISTS (
    SELECT 1 FROM league_members WHERE "leagueId" = leagues.id AND "userId" = auth.uid()
  ));
CREATE POLICY "League admin manage league" ON leagues FOR ALL
  USING (auth.uid() = "adminId");

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_players_club     ON players(club);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_player_stats_gw  ON player_stats("playerId", gameweek);
CREATE INDEX IF NOT EXISTS idx_squads_user_gw   ON squads("userId", gameweek);
CREATE INDEX IF NOT EXISTS idx_fixtures_gw      ON fixtures(gameweek);

-- ─────────────────────────────────────────────────────────────────────────────
-- ADDITIONS: Admin Portal Support (headshot_url, status flags, match_events)
-- ─────────────────────────────────────────────────────────────────────────────

-- Add new columns to players table (idempotent)
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS headshot_url    TEXT,
  ADD COLUMN IF NOT EXISTS "isInjured"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isSuspended"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isActive"      BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "isPostponed"   BOOLEAN NOT NULL DEFAULT false;

-- Add is_admin flag to fantasy_users
ALTER TABLE fantasy_users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- ── match_events (Tisini stat override table) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS match_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "playerId"          UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  "fixtureId"         UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  gameweek            INTEGER NOT NULL,
  "minutesPlayed"     INTEGER NOT NULL DEFAULT 0,
  tries               INTEGER NOT NULL DEFAULT 0,
  "tryAssists"        INTEGER NOT NULL DEFAULT 0,
  conversions         INTEGER NOT NULL DEFAULT 0,
  "penaltyGoals"      INTEGER NOT NULL DEFAULT 0,
  "dropGoals"         INTEGER NOT NULL DEFAULT 0,
  tackles             INTEGER NOT NULL DEFAULT 0,
  carries             INTEGER NOT NULL DEFAULT 0,
  "lineoutsWon"       INTEGER NOT NULL DEFAULT 0,
  "lineoutsLost"      INTEGER NOT NULL DEFAULT 0,
  "scrumWon"          INTEGER NOT NULL DEFAULT 0,
  "scrumLost"         INTEGER NOT NULL DEFAULT 0,
  "yellowCards"       INTEGER NOT NULL DEFAULT 0,
  "redCards"          INTEGER NOT NULL DEFAULT 0,
  "isPostponed"       BOOLEAN NOT NULL DEFAULT false,
  "enteredByAdminId"  UUID REFERENCES fantasy_users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("playerId", "fixtureId")
);

-- Admin-only RLS for match_events
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage match_events" ON match_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM fantasy_users
    WHERE id = auth.uid() AND is_admin = true
  ));
CREATE POLICY "Match events are publicly readable" ON match_events FOR SELECT USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events("playerId", gameweek);
CREATE INDEX IF NOT EXISTS idx_match_events_fixture ON match_events("fixtureId");

-- ─────────────────────────────────────────────────────────────────────────────
-- DYNAMIC CLUBS (relegation/promotion safe)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clubs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL UNIQUE,
  abbreviation          TEXT NOT NULL UNIQUE,  -- e.g. 'KBS', 'KCB'
  logo_url              TEXT,                  -- Cloudinary URL (kenya-cup/logos)
  primary_color         TEXT NOT NULL DEFAULT '#ffffff',
  secondary_color       TEXT NOT NULL DEFAULT '#000000',
  home_ground           TEXT,
  is_active_in_kenya_cup BOOLEAN NOT NULL DEFAULT true,
  founded_year          INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Add club_id FK to players (replaces hardcoded club string)
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clubs_active ON clubs(is_active_in_kenya_cup);
CREATE INDEX IF NOT EXISTS idx_players_club_id ON players(club_id);

-- RLS
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clubs are publicly readable" ON clubs FOR SELECT USING (true);
CREATE POLICY "Admins manage clubs" ON clubs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM fantasy_users
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Seed clubs (run after creating the table)
INSERT INTO clubs (name, abbreviation, primary_color, home_ground, is_active_in_kenya_cup) VALUES
  ('Kabras Sugar',    'KBS', '#16a34a', 'Kakamega RFC', true),
  ('KCB Rugby',       'KCB', '#1d4ed8', 'KCB Sports Club', true),
  ('Menengai Oilers', 'MNO', '#7c3aed', 'Menengai RFC', true),
  ('Kenya Harlequin', 'HQN', '#dc2626', 'RFUEA Ground', true),
  ('Strathmore Leos', 'STR', '#059669', 'Strathmore University', true),
  ('KU Blak Blad',    'KUB', '#374151', 'Kenyatta University', true),
  ('Nondescripts',    'NDX', '#b45309', 'RFUEA Ground', true),
  ('Nakuru',          'NAK', '#0284c7', 'Nakuru RFC', true),
  ('Daystar Falcons', 'DAY', '#7c2d12', 'Daystar University', true),
  ('Impala',          'IMP', '#6d28d9', 'RFUEA Ground', true),
  ('Mwamba',          'MWA', '#0f766e', 'Mwamba RFC', true),
  ('JKUAT Cougars',   'JKU', '#92400e', 'JKUAT', true)
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- USERNAME support (unique @handle for each player)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE fantasy_users
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Enforce lowercase, alphanumeric + underscores, 3-20 chars
ALTER TABLE fantasy_users
  ADD CONSTRAINT chk_username_format
  CHECK (username ~ '^[a-z0-9_]{3,20}$');

CREATE INDEX IF NOT EXISTS idx_users_username ON fantasy_users(username);
