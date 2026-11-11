import {
  Player,
  ValidationResult,
  ScoringRules,
  PlayerStats,
  MatchEventData,
  Booster,
  BoosterType,
  MatchStatus,
} from '@/types/fantasy';

// ─────────────────────────────────────────────────────────────────────────────
// Official scoring rules for Kenya Cup Fantasy Rugby Season 26/27 (Overhauled)
// ─────────────────────────────────────────────────────────────────────────────
export const SCORING_RULES: ScoringRules = {
  // Appearance & Result
  startingPlayer: 2.0,
  substitutePlayer: 1.0,
  teamWin: 2.0,
  teamDraw: 1.0,

  // Scoring Play
  try: 5.0,
  conversion: 2.0,
  penaltyGoal: 3.0,
  penaltyKickMissed: -0.5,
  dropGoal: 3.0,

  // Forward Set-Piece Mastery (Props, Hookers, Locks, Flankers, No.8)
  forwardScrum100Pct: 2.0,
  forwardScrumOpponentPutIn: 1.0,
  forwardLineout90Pct: 2.0,
  forwardLineoutOpponent20Pct: 1.0,

  // Individual Gameplay
  tryAssist: 2.0,
  tackle: 0.2, // 1.0 per 5 tackles
  carry: 0.1,  // 0.5 per 5 metres carried
  cleanBreak: 1.0,
  turnoverWon: 1.0,
  oppositionLineoutSteal: 1.0,
  missedTackle: -0.5,
  handlingError: -0.5,
  penaltyConceded: -1.0,
  kick50_22: 2.0,
  playerOfTheMatch: 3.0,

  // Cards
  yellowCard: -4.0,
  redCard: -8.0,

  // Preserved backward-compatible stats
  lineoutWon: 1,
  lineoutLost: -1,
  scrumWon: 1,
  scrumLost: -1,
  minutesPlayed60Plus: 2,
  minutesPlayed30Plus: 1,
};

// ── Timeline & Audit Locking ─────────────────────────────────────────────────
export const AUDIT_LOCK_HOURS = 30;
export const AUDIT_LOCK_DURATION_MS = AUDIT_LOCK_HOURS * 60 * 60 * 1000;

/**
 * Checks whether a match has passed the 30-hour post-match audit lock window.
 */
export function isMatchAuditLocked(kickoffTime: string | Date): boolean {
  const matchTime = new Date(kickoffTime).getTime();
  const matchEndTime = matchTime + 2 * 60 * 60 * 1000; // estimated 2-hour duration
  return Date.now() - matchEndTime > AUDIT_LOCK_DURATION_MS;
}

/**
 * Returns whether scoring is provisional or final audited.
 */
export function getScoringAuditStatus(kickoffTime: string | Date): 'PROVISIONAL' | 'FINAL_AUDITED' {
  return isMatchAuditLocked(kickoffTime) ? 'FINAL_AUDITED' : 'PROVISIONAL';
}

/**
 * Determines whether a position is a Forward (Props, Hookers, Locks, Flankers, Number 8, Front Row, Back Row).
 */
export function isForwardPosition(pos?: string): boolean {
  if (!pos) return false;
  const p = pos.toLowerCase();
  return (
    p.includes('prop') ||
    p.includes('hooker') ||
    p.includes('lock') ||
    p.includes('flanker') ||
    p.includes('number 8') ||
    p.includes('no.8') ||
    p.includes('no 8') ||
    p.includes('front row') ||
    p.includes('back row')
  );
}

export function isFrontRowPosition(pos?: string): boolean {
  if (!pos) return false;
  return (
    pos === 'Loosehead Prop' ||
    pos === 'Tighthead Prop' ||
    pos === 'Hooker' ||
    pos === 'Front Row' ||
    pos === 'Prop'
  );
}

export function isHookerPosition(pos?: string): boolean {
  if (!pos) return false;
  return pos === 'Hooker';
}

export function isJumperPosition(pos?: string): boolean {
  if (!pos) return false;
  return (
    pos === 'Lock' ||
    pos === 'Blindside Flanker' ||
    pos === 'Openside Flanker' ||
    pos === 'Number 8' ||
    pos === 'Back Row' ||
    pos === 'Flanker'
  );
}

export function getPositionCategory(pos?: string): string {
  if (!pos) return 'Back';
  switch (pos) {
    case 'Loosehead Prop':
    case 'Tighthead Prop':
    case 'Front Row':
    case 'Prop':
      return 'Prop';
    case 'Hooker':
      return 'Hooker';
    case 'Lock':
      return 'Lock';
    case 'Blindside Flanker':
    case 'Openside Flanker':
    case 'Back Row':
    case 'Flanker':
      return 'Flanker';
    case 'Number 8':
      return 'Number 8';
    case 'Scrum-half':
      return 'Scrum-half';
    case 'Fly-half':
      return 'Fly-half';
    case 'Inside Center':
    case 'Outside Center':
    case 'Center':
      return 'Center';
    case 'Left Wing':
    case 'Right Wing':
    case 'Wing':
      return 'Wing';
    case 'Fullback':
    case 'Full-back':
      return 'Full-back';
    case 'Utility Back':
      return 'Utility Back';
    default:
      return pos;
  }
}

export const SQUAD_RULES = {
  TOTAL_PLAYERS: 23,
  STARTERS_COUNT: 15,
  BENCH_COUNT: 8,
  TOTAL_BUDGET: 150_000_000,
  MAX_PER_CLUB: 4,
  TIERS: {
    'Tier 1': 10_000_000,
    'Tier 2':  7_500_000,
    'Tier 3':  5_500_000,
    'Tier 4':  3_500_000,
  },
  POSITION_LIMITS: {
    'Prop':       { min: 3, max: 6 },
    'Hooker':     { min: 2, max: 4 },
    'Lock':       { min: 3, max: 5 },
    'Flanker':    { min: 3, max: 6 },
    'Number 8':   { min: 1, max: 3 },
    'Scrum-half': { min: 2, max: 4 },
    'Fly-half':   { min: 2, max: 4 },
    'Center':     { min: 2, max: 5 },
    'Wing':       { min: 2, max: 5 },
    'Full-back':  { min: 1, max: 3 },
  } as Record<string, { min: number; max: number }>,
};

// ─────────────────────────────────────────────────────────────────────────────
// Official Boosters / Chips Configuration
// ─────────────────────────────────────────────────────────────────────────────
export const BOOSTERS_LIST: Booster[] = [
  {
    id: 'triple',
    label: 'Triple Captain',
    short: '3×C',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.2)',
    description: 'Your designated Captain scores 3× points instead of 2× for this round.',
  },
  {
    id: 'limit',
    label: 'Limitless',
    short: 'LIM',
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.2)',
    description: 'Unlimited budget for this round — KES 150M salary cap is lifted.',
  },
  {
    id: 'co',
    label: 'Co-Captains',
    short: 'CO-C',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.2)',
    description: 'Both Captain AND Vice-Captain score 2× double points for this round.',
  },
  {
    id: 'BENCH_BOOST',
    label: 'Bench Boost',
    short: 'BB',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.2)',
    description: 'All 8 substitute bench players score fantasy points for your team this round!',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default Zero-Initialized Match Event Data (Unified Legacy & Overhauled Matrix)
// ─────────────────────────────────────────────────────────────────────────────
export const EMPTY_MATCH_EVENT_DATA: MatchEventData = {
  // Existing legacy stats
  minutesPlayed: 80,
  tries: 0,
  tryAssists: 0,
  conversions: 0,
  penaltyGoals: 0,
  dropGoals: 0,
  tackles: 0,
  carries: 0,
  lineoutsWon: 0,
  lineoutsLost: 0,
  scrumsWon: 0,
  scrumsLost: 0,
  yellowCards: 0,
  redCards: 0,

  // Appearance & Result
  isStartingPlayer: true,
  isSubstitute: false,
  teamWon: false,
  teamDraw: false,

  // Scoring
  penaltyKicksMissed: 0,

  // Team Gameplay (Forwards Only)
  forwardsScrumsWon100: false,
  forwardsScrumsWonOpponent: 0,
  forwardsLineoutsWon90: false,
  forwardsLineoutsStolen20: false,

  // Individual Gameplay
  metresCarried: 0,
  cleanBreaks: 0,
  defendersBeaten: 0,
  turnoversWon: 0,
  lineoutsStolenIndividual: 0,
  missedTackles: 0,
  handlingErrors: 0,
  penaltiesConceded: 0,
  kicks50_22: 0,
  playerOfTheMatch: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Calculate fantasy points for a single player in a gameweek
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePoints(
  stats: PlayerStats | MatchEventData,
  isCaptain: boolean = false,
  booster?: BoosterType | null,
  isViceCaptain?: boolean,
  matchStatus?: MatchStatus,
  rosterStatus?: 'STARTER' | 'BENCH',
  position?: string
): number {
  const s = SCORING_RULES;
  let pts = 0;

  // 1. Appearance & Match Result
  // Starting Player: +2.0
  if (
    stats.isStartingPlayer ||
    ('isStarter' in stats && stats.isStarter) ||
    matchStatus === 'starting' ||
    stats.minutesPlayed >= 50
  ) {
    pts += s.startingPlayer; // +2.0
  } else if (
    stats.isSubstitute ||
    matchStatus === 'bench' ||
    (stats.minutesPlayed > 0 && stats.minutesPlayed < 50)
  ) {
    pts += s.substitutePlayer; // +1.0
  }

  // Result: Win (+2.0) or Draw (+1.0)
  if (stats.teamWon || ('teamResult' in stats && stats.teamResult === 'win')) {
    pts += s.teamWin; // +2.0
  } else if (stats.teamDraw || ('teamResult' in stats && stats.teamResult === 'draw')) {
    pts += s.teamDraw; // +1.0
  }

  // 2. Scoring Play
  pts += (stats.tries || 0) * s.try; // +5.0
  pts += (stats.conversions || 0) * s.conversion; // +2.0
  pts += (stats.penaltyGoals || 0) * s.penaltyGoal; // +3.0
  if (stats.penaltyKicksMissed) pts += stats.penaltyKicksMissed * s.penaltyKickMissed; // -0.5
  pts += (stats.dropGoals || 0) * s.dropGoal; // +3.0

  // 3. Team Gameplay (Applied EXCLUSIVELY to Forwards: Props, Hookers, Locks, Flankers, No.8)
  const isForward =
    ('isForward' in stats && stats.isForward) ??
    isForwardPosition(position || ('position' in stats ? stats.position : undefined));

  if (isForward) {
    // Forwards win 100% of own scrums: +2.0 (each forward)
    const has100Scrums =
      stats.forwardsScrumsWon100 ||
      ('ownScrumsWonPercent' in stats && stats.ownScrumsWonPercent !== undefined && stats.ownScrumsWonPercent >= 100);

    if (has100Scrums) {
      pts += s.forwardScrum100Pct;
    } else {
      // Backward compatibility with legacy scrum count (won > 0, lost === 0)
      const sw = stats.scrumsWon ?? stats.scrumWon ?? 0;
      const sl = stats.scrumsLost ?? stats.scrumLost ?? 0;
      if (sw > 0 && sl === 0) {
        pts += s.forwardScrum100Pct;
      }
    }

    // Scrum won on opponent's put-in: +1.0 (per scrum, to each forward)
    const oppScrums =
      stats.forwardsScrumsWonOpponent ||
      ('scrumsWonOnOpponentPutIn' in stats ? stats.scrumsWonOnOpponentPutIn || 0 : 0);
    if (oppScrums > 0) {
      pts += oppScrums * s.forwardScrumOpponentPutIn;
    }

    // Forwards win 90% of own lineouts: +2.0 (each forward)
    const has90Lineouts =
      stats.forwardsLineoutsWon90 ||
      ('ownLineoutsWonPercent' in stats && stats.ownLineoutsWonPercent !== undefined && stats.ownLineoutsWonPercent >= 90);

    if (has90Lineouts) {
      pts += s.forwardLineout90Pct;
    } else if (stats.lineoutsWon && !stats.lineoutsLost) {
      // Backward compatibility with legacy lineout count
      pts += s.forwardLineout90Pct;
    }

    // Forwards win 20% of opposition lineouts: +1.0 (each forward)
    const has20OppLineouts =
      stats.forwardsLineoutsStolen20 ||
      ('oppositionLineoutsWonPercent' in stats && stats.oppositionLineoutsWonPercent !== undefined && stats.oppositionLineoutsWonPercent >= 20);

    if (has20OppLineouts) {
      pts += s.forwardLineoutOpponent20Pct;
    }
  }

  // 4. Individual Gameplay
  pts += (stats.tryAssists || 0) * s.tryAssist; // +2.0

  // Tackles: +1.0 Per 5 tackles made
  if (stats.tackles) {
    pts += Math.floor(stats.tackles / 5) * 1.0;
  }

  // Ball carries: +0.5 Per 5 metres carried
  if (stats.metresCarried && stats.metresCarried > 0) {
    pts += Math.floor(stats.metresCarried / 5) * 0.5;
  } else if (stats.carries && stats.carries > 0) {
    // Legacy fallback: 1 carry roughly represents 5 metres
    pts += Math.floor((stats.carries * 5) / 5) * 0.5;
  }

  if (stats.cleanBreaks) pts += stats.cleanBreaks * s.cleanBreak; // +1.0
  if (stats.defendersBeaten) pts += Math.floor(stats.defendersBeaten / 2) * 1.0; // +1.0 per 2 defenders
  if (stats.turnoversWon) pts += stats.turnoversWon * s.turnoverWon; // +1.0

  // Opposition lineout steal (individual)
  const lineoutSteals =
    stats.lineoutsStolenIndividual ||
    ('oppositionLineoutSteals' in stats ? stats.oppositionLineoutSteals || 0 : 0);
  if (lineoutSteals) pts += lineoutSteals * s.oppositionLineoutSteal; // +1.0

  if (stats.missedTackles) pts += stats.missedTackles * s.missedTackle; // -0.5
  if (stats.handlingErrors) pts += stats.handlingErrors * s.handlingError; // -0.5
  if (stats.penaltiesConceded) pts += stats.penaltiesConceded * s.penaltyConceded; // -1.0
  if (stats.kicks50_22) pts += stats.kicks50_22 * s.kick50_22; // +2.0

  // Player of the match (+3.0)
  if (stats.playerOfTheMatch || ('isPlayerOfTheMatch' in stats && stats.isPlayerOfTheMatch)) {
    pts += s.playerOfTheMatch; // +3.0
  }

  // 5. Discipline & Cards
  pts += (stats.yellowCards || 0) * s.yellowCard; // -4.0
  pts += (stats.redCards || 0) * s.redCard;       // -8.0

  let total = Math.max(0, Number(pts.toFixed(1)));

  // Bench Boost Chip Logic:
  // If player is marked as BENCH in manager's squad, they only score if Bench Boost is active!
  const isBenchBoostActive = booster === 'BENCH_BOOST' || booster === 'bench';
  if (rosterStatus === 'BENCH' && !isBenchBoostActive) {
    return 0;
  }

  // Bench impact bonus for players coming off the real bench during Bench Boost
  if (isBenchBoostActive && matchStatus === 'bench') {
    total = Number((total * 1.5).toFixed(1));
  }

  // Multiplier logic
  if (isCaptain) {
    if (booster === 'triple') return Number((total * 3).toFixed(1));
    return Number((total * 2).toFixed(1));
  }

  if (isViceCaptain && booster === 'co') {
    return Number((total * 2).toFixed(1));
  }

  return total;
}

// ─────────────────────────────────────────────────────────────────────────────
// Squad validation
// ─────────────────────────────────────────────────────────────────────────────
export function validateSquad(players: Player[], booster?: BoosterType | null): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Total player count
  if (players.length > SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Squad has ${players.length} players — maximum is ${SQUAD_RULES.TOTAL_PLAYERS}.`);
  }

  // Budget check (skipped if Limitless booster is active)
  const isLimitless = booster === 'limit';
  const spent = players.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
  const totalBudget = Number(SQUAD_RULES.TOTAL_BUDGET);
  if (!isLimitless && spent > totalBudget) {
    errors.push(`Over budget by KES ${((spent - totalBudget) / 1_000_000).toFixed(1)}M.`);
  }

  // Per-club limit
  const clubCount: Record<string, number> = {};
  for (const p of players) {
    clubCount[p.club] = (clubCount[p.club] ?? 0) + 1;
    if (clubCount[p.club] > SQUAD_RULES.MAX_PER_CLUB) {
      errors.push(`Too many players from ${p.club} (max ${SQUAD_RULES.MAX_PER_CLUB}).`);
    }
  }

  // Position limits (normalized to positional categories)
  const posCounts: Record<string, number> = {};
  for (const p of players) {
    const cat = getPositionCategory(p.position);
    posCounts[cat] = (posCounts[cat] ?? 0) + 1;
  }

  for (const [pos, limit] of Object.entries(SQUAD_RULES.POSITION_LIMITS)) {
    const count = posCounts[pos] ?? 0;
    if (count < limit.min && players.length === SQUAD_RULES.TOTAL_PLAYERS) {
      errors.push(`Need at least ${limit.min} ${pos}(s) — only have ${count}.`);
    }
    if (count > limit.max) {
      errors.push(`Too many ${pos}s — max ${limit.max}, have ${count}.`);
    }
  }

  // Must have at least 4 front-row players for a 23-man squad
  const frontRow = players.filter(p => p.isFrontRow || isFrontRowPosition(p.position)).length;
  if (frontRow < 4 && players.length === SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Need at least 4 front-row players (Props & Hookers) in your 23-man squad, have ${frontRow}.`);
  }

  // Warnings for incomplete squad
  if (players.length < SQUAD_RULES.TOTAL_PLAYERS) {
    warnings.push(`${SQUAD_RULES.TOTAL_PLAYERS - players.length} more player(s) needed.`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Can a player be added to the current squad?
// Strictly parse costs as Numbers and compare string IDs to avoid ghost state.
// ─────────────────────────────────────────────────────────────────────────────
export function canAddPlayer(
  player: Player,
  currentPlayers: Player[],
  budget: number,
  booster?: BoosterType | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const targetId = String(player.id);
  // Already in squad check
  if (currentPlayers.some(p => String(p.id) === targetId)) {
    errors.push('Player is already in your squad.');
    return { isValid: false, errors, warnings };
  }

  // Squad full check
  if (currentPlayers.length >= SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Your squad is full (${SQUAD_RULES.TOTAL_PLAYERS} players).`);
    return { isValid: false, errors, warnings };
  }

  // Budget check (skipped if Limitless booster is active)
  const isLimitless = booster === 'limit';
  const playerCost = Number(player.cost) || 0;
  const availableBudget = Number(budget) || 0;
  if (!isLimitless && playerCost > availableBudget) {
    errors.push(`Insufficient budget. Need KES ${(playerCost / 1_000_000).toFixed(1)}M, have KES ${(availableBudget / 1_000_000).toFixed(1)}M.`);
  }

  // Club limit
  const clubCount = currentPlayers.filter(p => p.club === player.club).length;
  if (clubCount >= SQUAD_RULES.MAX_PER_CLUB) {
    errors.push(`Already have ${SQUAD_RULES.MAX_PER_CLUB} players from ${player.club}.`);
  }

  // Position limit
  const cat = getPositionCategory(player.position);
  const posLimit = SQUAD_RULES.POSITION_LIMITS[cat];
  const posCount = currentPlayers.filter(p => getPositionCategory(p.position) === cat).length;
  if (posLimit && posCount >= posLimit.max) {
    errors.push(`Position limit reached for ${cat} (max ${posLimit.max}).`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validate squad specifically for "Save Squad" action
// Requires all 23 players (15 Starters, 8 Substitutes) and Captain.
// ─────────────────────────────────────────────────────────────────────────────
export function validateSquadForSave(
  players: Player[],
  captainId: string | null,
  booster?: BoosterType | null,
  viceCaptainId?: string | null,
  squadPlayers?: { rosterStatus?: 'STARTER' | 'BENCH'; pitchSlot?: number }[]
): ValidationResult {
  const baseResult = validateSquad(players, booster);
  const errors = [...baseResult.errors];
  const warnings = [...baseResult.warnings];

  if (players.length < SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Squad is incomplete (${players.length}/${SQUAD_RULES.TOTAL_PLAYERS} players). Complete your 23-man matchday roster (15 Starters + 8 Substitutes) to save.`);
  }

  if (squadPlayers && squadPlayers.length === SQUAD_RULES.TOTAL_PLAYERS) {
    const starters = squadPlayers.filter(sp => sp.rosterStatus === 'STARTER' || (sp.pitchSlot && sp.pitchSlot <= 15)).length;
    const bench = squadPlayers.filter(sp => sp.rosterStatus === 'BENCH' || (sp.pitchSlot && sp.pitchSlot > 15)).length;

    if (starters !== SQUAD_RULES.STARTERS_COUNT) {
      errors.push(`Must have exactly 15 Starters on the pitch (currently ${starters}).`);
    }
    if (bench !== SQUAD_RULES.BENCH_COUNT) {
      errors.push(`Must have exactly 8 Substitutes on the bench (currently ${bench}).`);
    }
  }

  // Captaincy validation decoupled from addPlayer and only enforced on Save Squad
  if (!captainId || !players.some(p => String(p.id) === String(captainId))) {
    errors.push('👑 Please designate a team Captain (C) before saving your squad.');
  }

  // Booster requirements validation
  if (booster === 'triple' && !captainId) {
    errors.push('👑 Triple Captain chip requires an assigned team Captain.');
  }

  if (booster === 'co') {
    if (!captainId || !viceCaptainId || !players.some(p => String(p.id) === String(viceCaptainId))) {
      errors.push('👥 Co-Captains chip requires both a designated Captain and a Vice-Captain (Assistant).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: errors.length === 0 ? [] : warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Format currency helper
// ─────────────────────────────────────────────────────────────────────────────
export function formatCost(cost: number): string {
  return `KES ${(cost / 1_000_000).toFixed(1)}M`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Check if a player's match has kicked off (lockout)
// ─────────────────────────────────────────────────────────────────────────────
export function isPlayerLocked(player: Player): boolean {
  return new Date(player.matchKickoffTime) <= new Date();
}

// ─────────────────────────────────────────────────────────────────────────────
// Countdown string helper
// ─────────────────────────────────────────────────────────────────────────────
export function getDeadlineCountdown(deadlineISO: string): string {
  const now = new Date();
  const deadline = new Date(deadlineISO);
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) return 'Deadline passed';

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
