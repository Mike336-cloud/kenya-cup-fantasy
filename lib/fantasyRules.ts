import { Player, ValidationResult, ScoringRules, PlayerStats } from '@/types/fantasy';

// ─────────────────────────────────────────────────────────────────────────────
// Official scoring rules for Kenya Cup Fantasy Rugby Season 26/27
// ─────────────────────────────────────────────────────────────────────────────
export const SCORING_RULES: ScoringRules = {
  try: 5,
  tryAssist: 3,
  conversion: 2,
  penaltyGoal: 3,
  dropGoal: 3,
  tackle: 0.5,
  carry: 0.5,
  lineoutWon: 1,
  lineoutLost: -1,
  scrumWon: 1,
  scrumLost: -1,
  yellowCard: -3,
  redCard: -5,
  minutesPlayed60Plus: 2,
  minutesPlayed30Plus: 1,
};

export const SQUAD_RULES = {
  TOTAL_PLAYERS: 15,
  TOTAL_BUDGET: 100_000_000,
  MAX_PER_CLUB: 3,
  TIERS: {
    'Tier 1': 10_000_000,
    'Tier 2':  7_500_000,
    'Tier 3':  5_500_000,
    'Tier 4':  3_500_000,
  },
  POSITION_LIMITS: {
    'Prop':       { min: 2, max: 3 },
    'Hooker':     { min: 1, max: 2 },
    'Lock':       { min: 2, max: 3 },
    'Flanker':    { min: 2, max: 3 },
    'Number 8':   { min: 1, max: 2 },
    'Scrum-half': { min: 1, max: 2 },
    'Fly-half':   { min: 1, max: 2 },
    'Center':     { min: 2, max: 3 },
    'Wing':       { min: 2, max: 3 },
    'Full-back':  { min: 1, max: 2 },
  } as Record<string, { min: number; max: number }>,
};

// ─────────────────────────────────────────────────────────────────────────────
// Calculate fantasy points for a single player in a gameweek
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePoints(stats: PlayerStats, isCaptain: boolean): number {
  const s = SCORING_RULES;
  let pts = 0;

  // Appearance points
  if (stats.minutesPlayed >= 60) pts += s.minutesPlayed60Plus;
  else if (stats.minutesPlayed >= 30) pts += s.minutesPlayed30Plus;

  // Scoring
  pts += stats.tries        * s.try;
  pts += stats.tryAssists   * s.tryAssist;
  pts += stats.conversions  * s.conversion;
  pts += stats.penaltyGoals * s.penaltyGoal;
  pts += stats.dropGoals    * s.dropGoal;

  // Work rate
  pts += stats.tackles * s.tackle;
  pts += stats.carries * s.carry;

  // Set piece
  pts += stats.lineoutsWon  * s.lineoutWon;
  pts += stats.lineoutsLost * s.lineoutLost;
  pts += stats.scrumWon     * s.scrumWon;
  pts += stats.scrumLost    * s.scrumLost;

  // Discipline
  pts += stats.yellowCards * s.yellowCard;
  pts += stats.redCards    * s.redCard;

  const total = Math.max(0, pts);
  return isCaptain ? total * 2 : total;
}

// ─────────────────────────────────────────────────────────────────────────────
// Squad validation
// ─────────────────────────────────────────────────────────────────────────────
export function validateSquad(players: Player[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Total player count
  if (players.length > SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Squad has ${players.length} players — maximum is ${SQUAD_RULES.TOTAL_PLAYERS}.`);
  }

  // Budget check (strict numeric parsing)
  const spent = players.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
  const totalBudget = Number(SQUAD_RULES.TOTAL_BUDGET);
  if (spent > totalBudget) {
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

  // Position limits
  const posCounts: Record<string, number> = {};
  for (const p of players) {
    posCounts[p.position] = (posCounts[p.position] ?? 0) + 1;
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

  // Must have at least 3 front-row players
  const frontRow = players.filter(p => p.isFrontRow).length;
  if (frontRow < 3 && players.length === SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Need at least 3 front-row players (2 Props + 1 Hooker), have ${frontRow}.`);
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
export function canAddPlayer(player: Player, currentPlayers: Player[], budget: number): ValidationResult {
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
    errors.push('Your squad is full (15 players).');
    return { isValid: false, errors, warnings };
  }

  // Budget check (strict numeric parsing, no string concatenation or float error)
  const playerCost = Number(player.cost) || 0;
  const availableBudget = Number(budget) || 0;
  if (playerCost > availableBudget) {
    errors.push(`Insufficient budget. Need KES ${(playerCost / 1_000_000).toFixed(1)}M, have KES ${(availableBudget / 1_000_000).toFixed(1)}M.`);
  }

  // Club limit
  const clubCount = currentPlayers.filter(p => p.club === player.club).length;
  if (clubCount >= SQUAD_RULES.MAX_PER_CLUB) {
    errors.push(`Already have ${SQUAD_RULES.MAX_PER_CLUB} players from ${player.club}.`);
  }

  // Position limit
  const posLimit = SQUAD_RULES.POSITION_LIMITS[player.position];
  const posCount = currentPlayers.filter(p => p.position === player.position).length;
  if (posLimit && posCount >= posLimit.max) {
    errors.push(`Position limit reached for ${player.position} (max ${posLimit.max}).`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validate squad specifically for "Save Squad" action
// Captaincy is strictly required HERE and only here when squad has 15 players.
// ─────────────────────────────────────────────────────────────────────────────
export function validateSquadForSave(
  players: Player[],
  captainId: string | null
): ValidationResult {
  const baseResult = validateSquad(players);
  const errors = [...baseResult.errors];
  const warnings = [...baseResult.warnings];

  if (players.length < SQUAD_RULES.TOTAL_PLAYERS) {
    errors.push(`Squad is incomplete (${players.length}/15 players). Complete your 15-man roster to save.`);
  }

  // Captaincy validation decoupled from addPlayer and only enforced on Save Squad
  if (!captainId || !players.some(p => String(p.id) === String(captainId))) {
    errors.push('Please designate a team Captain (C) before saving your squad.');
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
