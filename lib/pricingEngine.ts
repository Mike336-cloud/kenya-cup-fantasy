// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Player Pricing Engine (Kenya Cup Transfer Market)
// Runs at the end of each Gameweek when match statuses are finalized.
// ─────────────────────────────────────────────────────────────────────────────
import { Player, Tier } from '@/types/fantasy';

export const TIER_BASELINE_EXPECTATION: Record<Tier, number> = {
  'Tier 1': 15.0, // Expected fantasy points per match
  'Tier 2': 10.0,
  'Tier 3':  7.0,
  'Tier 4':  4.5,
};

// Market bounds
export const MIN_PLAYER_COST =  2_500_000; // KES 2.5M floor
export const MAX_PLAYER_COST = 18_000_000; // KES 18.0M ceiling
export const MAX_WEEKLY_DELTA =  1_000_000; // ±1M max shift per round
export const VALUE_PER_POINT_DELTA = 250_000; // KES 250k per point above/below tier expectation

export interface PriceCalculationResult {
  playerId: string;
  playerName: string;
  tier: Tier;
  previousCost: number;
  currentCost: number;
  newCost: number;
  priceChange: number;
  percentageChange: number;
  formRating: number;
}

/**
 * Calculates a weighted 3-match form rating.
 * Most recent match carries 50% weight, 2nd carries 30%, 3rd carries 20%.
 */
export function calculateFormRating(recentScores: number[], tier: Tier): number {
  if (!recentScores || recentScores.length === 0) {
    return TIER_BASELINE_EXPECTATION[tier] || 5.0;
  }

  if (recentScores.length === 1) {
    return Number(recentScores[0].toFixed(2));
  }

  if (recentScores.length === 2) {
    const weighted = recentScores[0] * 0.6 + recentScores[1] * 0.4;
    return Number(weighted.toFixed(2));
  }

  // Last 3 matches
  const weighted = recentScores[0] * 0.5 + recentScores[1] * 0.3 + recentScores[2] * 0.2;
  return Number(weighted.toFixed(2));
}

/**
 * Computes updated player value based on form rating vs baseline tier expectation.
 */
export function calculatePlayerPriceUpdate(
  player: Player,
  recentScores: number[]
): PriceCalculationResult {
  const currentCost = Number(player.cost) || 7_500_000;
  const previousCost = player.previous_cost ? Number(player.previous_cost) : currentCost;
  const tier = player.tier || 'Tier 2';
  const baseline = TIER_BASELINE_EXPECTATION[tier] ?? 10.0;

  const formRating = calculateFormRating(recentScores, tier);
  const performanceDelta = formRating - baseline;

  // Uncapped raw adjustment
  let rawChange = performanceDelta * VALUE_PER_POINT_DELTA;

  // Enforce weekly fluctuation boundaries (± KES 1,000,000 max)
  if (rawChange > MAX_WEEKLY_DELTA) rawChange = MAX_WEEKLY_DELTA;
  if (rawChange < -MAX_WEEKLY_DELTA) rawChange = -MAX_WEEKLY_DELTA;

  // Round to nearest 100,000 KES
  const roundedChange = Math.round(rawChange / 100_000) * 100_000;

  // Apply to cost with global market floor and ceiling
  let newCost = currentCost + roundedChange;
  if (newCost < MIN_PLAYER_COST) newCost = MIN_PLAYER_COST;
  if (newCost > MAX_PLAYER_COST) newCost = MAX_PLAYER_COST;

  const finalChange = newCost - currentCost;
  const percentageChange = currentCost > 0 ? Number(((finalChange / currentCost) * 100).toFixed(2)) : 0;

  return {
    playerId: player.id,
    playerName: player.name,
    tier,
    previousCost: currentCost, // prior to this update
    currentCost,
    newCost,
    priceChange: finalChange,
    percentageChange,
    formRating,
  };
}

/**
 * Batch processes an array of players and returns transfer market valuation adjustments.
 */
export function runPricingEngine(
  players: Player[],
  playerScoresHistory: Record<string, number[]> = {}
): PriceCalculationResult[] {
  return players.map(p => {
    // Look up recent 3 match scores or derive from stats
    const history = playerScoresHistory[p.id] || (p.totalPoints ? [p.totalPoints / 2, p.totalPoints / 3] : []);
    return calculatePlayerPriceUpdate(p, history);
  });
}

