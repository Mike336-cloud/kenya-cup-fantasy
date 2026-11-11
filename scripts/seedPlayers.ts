/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Kenya Cup Fantasy Rugby – Database Player Seeding Script
 * 
 * Dynamically resolves clubs from the Supabase `clubs` table, maps raw Kenya Cup
 * player data according to official position rules, tiers, costs, and positional
 * flags (is_front_row, is_hooker, is_jumper), and inserts or updates the players.
 *
 * Execution:
 *   npx tsx scripts/seedPlayers.ts
 *   or:
 *   npm run seed:players
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ── 1. Environment Variable Loader (fallback for local files) ────────────────
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── 2. Raw Player Data ───────────────────────────────────────────────────────
interface RawPlayer {
  club: string;
  name: string;
  rawPosition: string;
  rawCost: string;
}

const RAW_PLAYERS: RawPlayer[] = [
  // ── Kabras Sugar RFC ──
  { club: 'Kabras Sugar RFC', name: 'Brian Tanga', rawPosition: 'Scrumhalf / Utility Back', rawCost: '10m' },
  { club: 'Kabras Sugar RFC', name: 'Kevin Wekesa', rawPosition: 'Back Row / Centre', rawCost: '10m' },
  { club: 'Kabras Sugar RFC', name: 'George Nyambua', rawPosition: 'Flanker', rawCost: '10m' },
  { club: 'Kabras Sugar RFC', name: 'Eugene Sifuna', rawPosition: 'Hooker', rawCost: '10m' },
  { club: 'Kabras Sugar RFC', name: 'Derrick Ashiundu', rawPosition: 'Centre', rawCost: '7.5m' },
  { club: 'Kabras Sugar RFC', name: 'Jeanson Misoga', rawPosition: 'Number 8', rawCost: '7.5m' },
  { club: 'Kabras Sugar RFC', name: 'Patrick Lumumba', rawPosition: 'Flanker / Lock', rawCost: '7.5m' },
  { club: 'Kabras Sugar RFC', name: 'Eric Cantona', rawPosition: 'Wing / Fullback', rawCost: '7.5m' },
  { club: 'Kabras Sugar RFC', name: 'Bryceson Adaka', rawPosition: 'Centre', rawCost: '7.5m' },
  { club: 'Kabras Sugar RFC', name: 'Walter Okoth', rawPosition: 'Flyhalf / Centre', rawCost: '7.5m' },

  // ── Menengai Oilers ──
  { club: 'Menengai Oilers', name: 'John Okoth', rawPosition: 'Centre / Utility Back', rawCost: '10m' },
  { club: 'Menengai Oilers', name: 'Elkeans Musonye', rawPosition: 'Back Row', rawCost: '10m' },
  { club: 'Menengai Oilers', name: 'Paul Mutsami', rawPosition: 'Inside Centre', rawCost: '10m' },
  { club: 'Menengai Oilers', name: 'Celestine Mboi', rawPosition: 'Hooker', rawCost: '7.5m' },
  { club: 'Menengai Oilers', name: 'Desterious Ifedha', rawPosition: 'Tighthead Prop', rawCost: '7.5m' },
  { club: 'Menengai Oilers', name: 'Ibrahim Ayoo', rawPosition: 'Lock / Back Row', rawCost: '7.5m' },
  { club: 'Menengai Oilers', name: 'Brian Achacha', rawPosition: 'Wing', rawCost: '7.5m' },
  { club: 'Menengai Oilers', name: 'Alvin Khavoli', rawPosition: 'Wing', rawCost: '7.5m' },
  { club: 'Menengai Oilers', name: 'Moses Ajack', rawPosition: 'Flyhalf', rawCost: '7.5m' },
  { club: 'Menengai Oilers', name: 'Andrew Odero', rawPosition: 'Scrumhalf', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Jeff Ojuok', rawPosition: 'Outside Centre', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Philip Okeyo', rawPosition: 'Fullback', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Abdon Jadah', rawPosition: 'Flanker', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Chrispine Shitundo', rawPosition: 'Flanker', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Collins Kabayo', rawPosition: 'Number 8', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Veron Kaburu', rawPosition: 'Utility Back', rawCost: '5.5m' },
  { club: 'Menengai Oilers', name: 'Byron Cornel', rawPosition: 'Loosehead Prop', rawCost: '3.5m' },
  { club: 'Menengai Oilers', name: 'Wallace Onyango', rawPosition: 'Lock', rawCost: '3.5m' },
  { club: 'Menengai Oilers', name: 'Argwings Ongili', rawPosition: 'Lock', rawCost: '3.5m' },

  // ── Nondescripts RFC ──
  { club: 'Nondescripts RFC', name: 'Ronnie Omondi', rawPosition: 'Fullback', rawCost: '10m' },
  { club: 'Nondescripts RFC', name: 'Charles Odhiambo', rawPosition: 'Outside Centre', rawCost: '7.5m' },
  { club: 'Nondescripts RFC', name: 'Ian Mumbwani', rawPosition: 'Scrumhalf', rawCost: '7.5m' },
  { club: 'Nondescripts RFC', name: 'Daniel Okito', rawPosition: 'Right Wing', rawCost: '7.5m' },
  { club: 'Nondescripts RFC', name: 'Brian Kadenge', rawPosition: 'Blindside Flanker', rawCost: '7.5m' },
  { club: 'Nondescripts RFC', name: 'Ken Nyakundi', rawPosition: 'Loosehead Prop', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Elisha Koronya', rawPosition: 'Tighthead Prop', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Hillary Baraza', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Tony Owuor', rawPosition: 'Number 8', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Martin Juma', rawPosition: 'Flyhalf', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Victor Rogena', rawPosition: 'Inside Centre', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'William Odhiambo', rawPosition: 'Left Wing', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Steve Odhiambo', rawPosition: 'Back Row', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Moses Begi', rawPosition: 'Utility Back', rawCost: '5.5m' },
  { club: 'Nondescripts RFC', name: 'Timothy Lugalia', rawPosition: 'Flyhalf / Utility Back', rawCost: '5.5m' },

  // ── Strathmore Leos ──
  { club: 'Strathmore Leos', name: 'Amon Wamalwa', rawPosition: 'Flyhalf / Utility Back', rawCost: '10m' },
  { club: 'Strathmore Leos', name: 'Shem Okola', rawPosition: 'Inside Centre', rawCost: '7.5m' },
  { club: 'Strathmore Leos', name: 'Morgan Ochiel', rawPosition: 'Centre', rawCost: '7.5m' },
  { club: 'Strathmore Leos', name: 'Dennis Mbilah', rawPosition: 'Number 8', rawCost: '7.5m' },
  { club: 'Strathmore Leos', name: 'Thomas Opio', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Bramwel Anekea', rawPosition: 'Tighthead Prop', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Salim Owino', rawPosition: 'Fullback', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Duke Odenyo', rawPosition: 'Back Row', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Darryl Wendo', rawPosition: 'Scrumhalf', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Luke Cheptile', rawPosition: 'Flyhalf', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Chaz Obiero', rawPosition: 'Wing', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Fitscon Kamulamba', rawPosition: 'Outside Centre', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Charles Wangwe', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Strathmore Leos', name: 'Peter Njogu', rawPosition: 'Loosehead Prop', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Nigel Okoko', rawPosition: 'Hooker', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Derrick Osano', rawPosition: 'Flanker', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Leo Opiayo', rawPosition: 'Flanker', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Brill Ank', rawPosition: 'Wing', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Mathew Arina', rawPosition: 'Front Row', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Glen Aguko', rawPosition: 'Prop', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Sam Omusi', rawPosition: 'Forward', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Isaac Samuel', rawPosition: 'Forward', rawCost: '3.5m' },
  { club: 'Strathmore Leos', name: 'Adrian Omollo', rawPosition: 'Back', rawCost: '3.5m' },

  // ── Kenya Harlequin ──
  { club: 'Kenya Harlequin', name: 'David Mwangi', rawPosition: 'Left Wing', rawCost: '7.5m' },
  { club: 'Kenya Harlequin', name: 'Faran Juma', rawPosition: 'Flyhalf', rawCost: '7.5m' },
  { club: 'Kenya Harlequin', name: 'Ramadhan Masete', rawPosition: 'Wing / Fullback', rawCost: '7.5m' },
  { club: 'Kenya Harlequin', name: 'Brighton Omondi', rawPosition: 'Utility Back', rawCost: '7.5m' },
  { club: 'Kenya Harlequin', name: 'Patrick Wainaina', rawPosition: 'Scrumhalf', rawCost: '7.5m' },
  { club: 'Kenya Harlequin', name: 'Albert Alela', rawPosition: 'Inside Centre', rawCost: '7.5m' },
  { club: 'Kenya Harlequin', name: 'Winston Odhiambo', rawPosition: 'Loosehead Prop', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'George Otieno', rawPosition: 'Hooker', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Nathaniel Mwangi', rawPosition: 'Tighthead Prop', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Edward Shitanda', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Jeff Kiragu', rawPosition: 'Number 8', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Alvin Mutachi', rawPosition: 'Outside Centre', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Michael Ochieng', rawPosition: 'Right Wing', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Reuben Masoni', rawPosition: 'Fullback', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Charles Kinyanjui', rawPosition: 'Utility Back', rawCost: '5.5m' },
  { club: 'Kenya Harlequin', name: 'Collins Odiwuor', rawPosition: 'Lock', rawCost: '3.5m' },
  { club: 'Kenya Harlequin', name: 'Matthew Ouma', rawPosition: 'Blindside Flanker', rawCost: '3.5m' },

  // ── Mwamba RFC ──
  { club: 'Mwamba RFC', name: 'Brian Ondego', rawPosition: 'Fullback', rawCost: '10m' },
  { club: 'Mwamba RFC', name: 'Raynold Anduvati', rawPosition: 'Inside Centre', rawCost: '7.5m' },
  { club: 'Mwamba RFC', name: 'Dennis Ndayala', rawPosition: 'Flyhalf', rawCost: '7.5m' },
  { club: 'Mwamba RFC', name: 'Edwin Watulo', rawPosition: 'Centre / Wing', rawCost: '7.5m' },
  { club: 'Mwamba RFC', name: 'Eugene Ojiambo', rawPosition: 'Utility Back', rawCost: '7.5m' },
  { club: 'Mwamba RFC', name: 'Ian Wamalwa', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Mwamba RFC', name: 'Barak Ouma', rawPosition: 'Left Wing', rawCost: '5.5m' },
  { club: 'Mwamba RFC', name: 'Joseph Odoyo', rawPosition: 'Outside Centre', rawCost: '5.5m' },

  // ── Nakuru RFC ──
  { club: 'Nakuru RFC', name: 'Edwin Anunda', rawPosition: 'Number 8', rawCost: '7.5m' },
  { club: 'Nakuru RFC', name: 'Felix Okoth', rawPosition: 'Lock', rawCost: '7.5m' },
  { club: 'Nakuru RFC', name: 'Fidel Wekesa', rawPosition: 'Outside Centre', rawCost: '7.5m' },
  { club: 'Nakuru RFC', name: 'Javan Otieno', rawPosition: 'Right Wing', rawCost: '7.5m' },
  { club: 'Nakuru RFC', name: 'Josephat Karanja', rawPosition: 'Flyhalf', rawCost: '7.5m' },
  { club: 'Nakuru RFC', name: 'Gilbert Ochieng', rawPosition: 'Utility Back', rawCost: '7.5m' },
  { club: 'Nakuru RFC', name: 'Caleb Malemo', rawPosition: 'Loosehead Prop', rawCost: '5.5m' },
  { club: 'Nakuru RFC', name: 'Emmanuel Mboya', rawPosition: 'Hooker', rawCost: '5.5m' },
  { club: 'Nakuru RFC', name: 'Bradford Khalumi', rawPosition: 'Tighthead Prop', rawCost: '5.5m' },
  { club: 'Nakuru RFC', name: 'Enock Obae', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Nakuru RFC', name: 'Kevin Kioko', rawPosition: 'Inside Centre', rawCost: '5.5m' },
  { club: 'Nakuru RFC', name: 'James Thiongo', rawPosition: 'Left Wing', rawCost: '5.5m' },

  // ── Impala RFC ──
  { club: 'Impala RFC', name: 'Tyson Okoth', rawPosition: 'Lock', rawCost: '7.5m' },
  { club: 'Impala RFC', name: 'Derrick Kinyari', rawPosition: 'Wing', rawCost: '7.5m' },
  { club: 'Impala RFC', name: 'Leon Onduso', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Victor Imela', rawPosition: 'Flanker', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Bonface Ogot', rawPosition: 'Back Row', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Billy Arigi', rawPosition: 'Number 8', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Patrick Mutuku', rawPosition: 'Flyhalf', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'David Nyangige', rawPosition: 'Scrumhalf', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Quinto Ongo', rawPosition: 'Wing', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Meshack Andale', rawPosition: 'Fullback', rawCost: '5.5m' },
  { club: 'Impala RFC', name: 'Warren Akaranga', rawPosition: 'Loosehead Prop', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Onesmus Kinyanjui', rawPosition: 'Hooker', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Milton Omondi', rawPosition: 'Tighthead Prop', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Samuel Muli', rawPosition: 'Scrumhalf', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'George Okowa', rawPosition: 'Centre', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Joshua Matasi', rawPosition: 'Front Row', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Brian Ochieng', rawPosition: 'Prop', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Tariq Ngige', rawPosition: 'Prop', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Shadrack Munoko', rawPosition: 'Forward', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Tobby Omondi', rawPosition: 'Back Row', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Martin Oyugi', rawPosition: 'Back', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Timothy Makiya', rawPosition: 'Back', rawCost: '3.5m' },
  { club: 'Impala RFC', name: 'Matoka Matoka', rawPosition: 'Wing', rawCost: '3.5m' },

  // ── JKUAT Cougars ──
  { club: 'JKUAT Cougars', name: 'Smith Muhoya', rawPosition: 'Flyhalf', rawCost: '7.5m' },
  { club: 'JKUAT Cougars', name: 'Erick Muru', rawPosition: 'Right Wing', rawCost: '7.5m' },
  { club: 'JKUAT Cougars', name: 'Houstone Omondi', rawPosition: 'Lock', rawCost: '5.5m' },
  { club: 'JKUAT Cougars', name: 'Masinga Ooko', rawPosition: 'Fullback', rawCost: '5.5m' },
  { club: 'JKUAT Cougars', name: 'Clyde Nyayoto', rawPosition: 'Number 8', rawCost: '5.5m' },
  { club: 'JKUAT Cougars', name: 'Mike Makau', rawPosition: 'Scrumhalf', rawCost: '5.5m' },
  { club: 'JKUAT Cougars', name: 'Karl Omito', rawPosition: 'Left Wing', rawCost: '5.5m' },
  { club: 'JKUAT Cougars', name: 'Godfrey Namamba', rawPosition: 'Outside Centre', rawCost: '5.5m' },
  { club: 'JKUAT Cougars', name: 'Emmanuel Okoth', rawPosition: 'Loosehead Prop', rawCost: '3.5m' },
  { club: 'JKUAT Cougars', name: 'Philip Macharia', rawPosition: 'Hooker', rawCost: '3.5m' },
  { club: 'JKUAT Cougars', name: 'Isaac Wekulo', rawPosition: 'Tighthead Prop', rawCost: '3.5m' },
];

// ── 3. Normalization & Mapping Helpers ───────────────────────────────────────

/**
 * Maps granular rugby position to standard legacy position recognized by older database constraints:
 * - 'Loosehead Prop', 'Tighthead Prop', 'Front Row' -> 'Prop'
 * - 'Blindside Flanker', 'Openside Flanker', 'Back Row' -> 'Flanker'
 * - 'Inside Center', 'Outside Center', 'Utility Back' -> 'Center'
 * - 'Left Wing', 'Right Wing' -> 'Wing'
 * - 'Fullback' -> 'Full-back'
 */
function mapToLegacyPosition(pos: string): string {
  switch (pos) {
    case 'Loosehead Prop':
    case 'Tighthead Prop':
    case 'Front Row':
      return 'Prop';
    case 'Blindside Flanker':
    case 'Openside Flanker':
    case 'Back Row':
      return 'Flanker';
    case 'Inside Center':
    case 'Outside Center':
    case 'Utility Back':
      return 'Center';
    case 'Left Wing':
    case 'Right Wing':
      return 'Wing';
    case 'Fullback':
      return 'Full-back';
    default:
      return pos;
  }
}

/**
 * Normalizes raw position text by defaulting to the first listed position (split on '/'),
 * and standardizing rugby union terminology to strict RugbyPosition.
 */
function normalizePosition(raw: string): string {
  const primary = raw.split('/')[0].trim();
  const lower = primary.toLowerCase();

  switch (lower) {
    case 'scrumhalf':
    case 'scrum-half':
    case 'scrum half':
      return 'Scrum-half';

    case 'flyhalf':
    case 'fly-half':
    case 'fly half':
      return 'Fly-half';

    case 'inside centre':
    case 'inside center':
      return 'Inside Center';

    case 'outside centre':
    case 'outside center':
      return 'Outside Center';

    case 'centre':
    case 'center':
      return 'Inside Center';

    case 'left wing':
      return 'Left Wing';

    case 'right wing':
      return 'Right Wing';

    case 'wing':
      return 'Left Wing';

    case 'fullback':
    case 'full-back':
    case 'full back':
      return 'Fullback';

    case 'loosehead prop':
    case 'loose-head prop':
    case 'lh prop':
      return 'Loosehead Prop';

    case 'tighthead prop':
    case 'tight-head prop':
    case 'th prop':
      return 'Tighthead Prop';

    case 'prop':
      return 'Loosehead Prop';

    case 'hooker':
      return 'Hooker';

    case 'lock':
      return 'Lock';

    case 'blindside flanker':
      return 'Blindside Flanker';

    case 'openside flanker':
      return 'Openside Flanker';

    case 'flanker':
      return 'Blindside Flanker';

    case 'number 8':
    case 'number eight':
    case 'no. 8':
    case 'no 8':
    case '8':
      return 'Number 8';

    case 'back row':
    case 'back-row':
      return 'Back Row';

    case 'front row':
    case 'front-row':
      return 'Front Row';

    case 'forward':
      return 'Front Row';

    case 'utility back':
    case 'back':
      return 'Utility Back';

    default:
      return 'Utility Back';
  }
}

/**
 * Computes official positional flags according to mission rules:
 * - Position contains "Prop" or "Hooker" -> is_front_row = true
 * - Position contains "Hooker" -> is_hooker = true
 * - Position contains "Lock", "Flanker", or "Number 8" -> is_jumper = true
 */
function computePositionalFlags(normalizedPos: string, rawPos: string) {
  const text = `${normalizedPos} ${rawPos}`.toLowerCase();

  const is_front_row = text.includes('prop') || text.includes('hooker') || text.includes('front row');
  const is_hooker = text.includes('hooker');
  const is_jumper = text.includes('lock') || text.includes('flanker') || text.includes('number 8') || text.includes('back row');

  const is_forward = is_front_row || is_jumper;
  const positionGroup = is_forward ? 'Forward' : 'Back';

  return {
    is_front_row,
    is_hooker,
    is_jumper,
    isFrontRow: is_front_row,
    isHooker: is_hooker,
    isJumper: is_jumper,
    positionGroup,
  };
}

/**
 * Maps raw cost strings into currency integer (KES) and corresponding Tier string:
 * - "10m" -> Cost: 10000000, Tier: 'Tier 1'
 * - "7.5m" -> Cost: 7500000, Tier: 'Tier 2'
 * - "5.5m" -> Cost: 5500000, Tier: 'Tier 3'
 * - "3.5m" -> Cost: 3500000, Tier: 'Tier 4'
 */
function parseCostAndTier(rawCost: string): { cost: number; tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' } {
  const cleaned = rawCost.toLowerCase().trim().replace('m', '');
  const val = parseFloat(cleaned);

  if (val >= 9.5) return { cost: 10_000_000, tier: 'Tier 1' };
  if (val >= 7.0) return { cost: 7_500_000, tier: 'Tier 2' };
  if (val >= 5.0) return { cost: 5_500_000, tier: 'Tier 3' };
  return { cost: 3_500_000, tier: 'Tier 4' };
}

/**
 * Resolves the raw club name to the exact canonical club name in the Kenya Cup database schema.
 */
function canonicalClubName(rawClub: string): string {
  const norm = rawClub.toLowerCase().trim();
  if (norm.includes('kabras')) return 'Kabras Sugar';
  if (norm.includes('kcb')) return 'KCB Rugby';
  if (norm.includes('menengai') || norm.includes('oilers')) return 'Menengai Oilers';
  if (norm.includes('harlequin') || norm.includes('quins')) return 'Kenya Harlequin';
  if (norm.includes('strathmore') || norm.includes('leos')) return 'Strathmore Leos';
  if (norm.includes('blak blad') || norm.includes('ku')) return 'KU Blak Blad';
  if (norm.includes('nondescripts') || norm.includes('nondies')) return 'Nondescripts';
  if (norm.includes('nakuru')) return 'Nakuru';
  if (norm.includes('daystar')) return 'Daystar Falcons';
  if (norm.includes('impala')) return 'Impala';
  if (norm.includes('mwamba')) return 'Mwamba';
  if (norm.includes('jkuat')) return 'JKUAT Cougars';
  return rawClub.replace(/\s+rfc$/i, '').trim();
}

// ── 4. Main Seed Execution ───────────────────────────────────────────────────
async function seedPlayers() {
  console.log('🚀 Starting Kenya Cup real player database seed...');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}`);

  // 1. Fetch clubs from the clubs table
  const { data: dbClubs, error: clubsError } = await supabase
    .from('clubs')
    .select('id, name, abbreviation, primary_color');

  if (clubsError) {
    console.error('❌ Failed to fetch clubs:', clubsError.message);
    process.exit(1);
  }

  if (!dbClubs || dbClubs.length === 0) {
    console.warn('⚠️ No clubs found in the `clubs` table. Please ensure the clubs table is seeded.');
  }

  const clubMap = new Map<string, { id: string; name: string }>();
  for (const c of dbClubs || []) {
    clubMap.set(c.name.toLowerCase().trim(), c);
  }

  console.log(`✅ Loaded ${dbClubs?.length ?? 0} clubs from database.`);

  // 2. Fetch existing players to allow idempotent update/insert
  const { data: existingPlayers, error: playersErr } = await supabase
    .from('players')
    .select('id, name, club');

  if (playersErr) {
    console.warn('⚠️ Could not query existing players (table might be empty or permissions restricted):', playersErr.message);
  }

  const existingMap = new Map<string, string>();
  for (const p of existingPlayers || []) {
    existingMap.set(p.name.toLowerCase().trim(), p.id);
  }

  // 3. Inspect columns on players table to support both camelCase and snake_case
  const { data: sampleRow } = await supabase.from('players').select('*').limit(1);
  const sampleKeys = sampleRow && sampleRow[0] ? new Set(Object.keys(sampleRow[0])) : null;

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  console.log(`📋 Processing ${RAW_PLAYERS.length} players...`);

  // 4. Batch process and insert/upsert players
  for (const raw of RAW_PLAYERS) {
    const canonicalClub = canonicalClubName(raw.club);
    const clubRecord = clubMap.get(canonicalClub.toLowerCase().trim());
    const clubId = clubRecord ? clubRecord.id : null;

    if (!clubId) {
      console.warn(`⚠️ Warning: Club ID could not be resolved for "${raw.club}" (mapped to "${canonicalClub}").`);
    }

    const pos = normalizePosition(raw.rawPosition);
    const flags = computePositionalFlags(pos, raw.rawPosition);
    const { cost, tier } = parseCostAndTier(raw.rawCost);

    const playerPayload: Record<string, unknown> = {
      name: raw.name.trim(),
      club: canonicalClub,
      club_id: clubId,
      position: pos,
      positionGroup: flags.positionGroup,
      tier,
      cost,
      matchKickoffTime: '2026-11-21T12:00:00.000Z',
      form: 5.0,
      totalPoints: 0,
      isActive: true,
      isInjured: false,
      isSuspended: false,
    };

    // Apply camelCase flags (standard in Supabase schema.sql)
    if (!sampleKeys || sampleKeys.has('isFrontRow')) playerPayload.isFrontRow = flags.is_front_row;
    if (!sampleKeys || sampleKeys.has('isHooker')) playerPayload.isHooker = flags.is_hooker;
    if (!sampleKeys || sampleKeys.has('isJumper')) playerPayload.isJumper = flags.is_jumper;

    // Apply snake_case flags if present in schema
    if (sampleKeys?.has('is_front_row')) playerPayload.is_front_row = flags.is_front_row;
    if (sampleKeys?.has('is_hooker')) playerPayload.is_hooker = flags.is_hooker;
    if (sampleKeys?.has('is_jumper')) playerPayload.is_jumper = flags.is_jumper;

    const existingId = existingMap.get(raw.name.toLowerCase().trim());

    if (existingId) {
      // Update existing record
      let { error: updateErr } = await supabase
        .from('players')
        .update(playerPayload)
        .eq('id', existingId);

      // If database constraint is still legacy, fallback to standard legacy position
      if (updateErr && updateErr.message.includes('players_position_check')) {
        const legacyPos = mapToLegacyPosition(pos);
        const retryPayload = { ...playerPayload, position: legacyPos };
        const retry = await supabase.from('players').update(retryPayload).eq('id', existingId);
        updateErr = retry.error;
      }

      if (updateErr) {
        console.error(`❌ Error updating "${raw.name}":`, updateErr.message);
        errorCount++;
      } else {
        updatedCount++;
      }
    } else {
      // Insert new record
      let { error: insertErr } = await supabase
        .from('players')
        .insert(playerPayload);

      // If database constraint is still legacy, fallback to standard legacy position
      if (insertErr && insertErr.message.includes('players_position_check')) {
        const legacyPos = mapToLegacyPosition(pos);
        const retryPayload = { ...playerPayload, position: legacyPos };
        const retry = await supabase.from('players').insert(retryPayload);
        insertErr = retry.error;
      }

      if (insertErr) {
        console.error(`❌ Error inserting "${raw.name}":`, insertErr.message);
        errorCount++;
      } else {
        insertedCount++;
      }
    }
  }

  console.log('\n─────────────────────────────────────────────────────────────────────────────');
  console.log('🎉 Seeding Complete Summary:');
  console.log(`   ✨ Newly Inserted: ${insertedCount}`);
  console.log(`   🔄 Updated:        ${updatedCount}`);
  if (errorCount > 0) {
    console.log(`   ⚠️ Errors:         ${errorCount}`);
  }
  console.log(`   👥 Total Handled:  ${RAW_PLAYERS.length}`);
  console.log('─────────────────────────────────────────────────────────────────────────────\n');
}

seedPlayers().catch(err => {
  console.error('💥 Fatal Seeding Error:', err);
  process.exit(1);
});

