import type {
  RegimeResult,
  MomentumResult,
  FundamentalsResult,
  DecisionSignal,
  EngineResult,
  PortfolioAction,
  PortfolioAllocation,
  TrancheSchedule,
} from '@/types/engine'

/**
 * PMW Decision Engine — Core Orchestrator
 *
 * Combines Regime, Momentum, and Fundamentals signals into a final score (-3 to +3),
 * applies the 200DMA overlay rule, checks the tranche deployment condition,
 * and produces the final portfolio action, allocation, and client text.
 */
export function runDecisionEngine(
  regime: RegimeResult,
  momentum: MomentumResult,
  fundamentals: FundamentalsResult,
  sp500Above200DMA: boolean,
): EngineResult {
  // Step 1: Sum signals
  const baseScore = regime.signal + momentum.signal + fundamentals.signal

  // Step 2: 200DMA Overlay
  // If S&P 500 is below its 200DMA → downgrade total score by 1
  const dmaOverlayApplied = !sp500Above200DMA
  const adjustedScore = clampScore(dmaOverlayApplied ? baseScore - 1 : baseScore)

  // Step 3: Map to signal and portfolio action
  const signal = getDecisionSignal(adjustedScore)
  const portfolioAction = getPortfolioAction(adjustedScore)
  const allocation = getAllocation(adjustedScore)

  // Step 4: Tranche deployment check
  // Condition: Momentum = Weak AND Regime ≠ Strong
  const trancheTriggered = momentum.label === 'Weak' && regime.label !== 'Risk ON'
  const tranche: EngineResult['tranche'] = trancheTriggered
    ? ({
        trancheActive: true,
        schedule: ['25% now', '25% lower', '25% stabilisation', '25% breakout'],
      } satisfies TrancheSchedule)
    : { trancheActive: false }

  // Step 5: Client-facing text
  const clientText = getClientText(adjustedScore)

  return {
    regime,
    momentum,
    fundamentals,
    baseScore,
    adjustedScore,
    dmaOverlayApplied,
    signal,
    portfolioAction,
    allocation,
    tranche,
    clientText,
    calculatedAt: new Date().toISOString(),
  }
}

// ── Lookup tables (from PMW Decision Matrix) ──────────────────────────────────

function getDecisionSignal(score: number): DecisionSignal {
  const map: Record<number, DecisionSignal> = {
    3: 'Aggressive Risk ON',
    2: 'Risk ON',
    1: 'Mild Risk ON',
    0: 'Neutral',
    [-1]: 'Caution',
    [-2]: 'Defensive',
    [-3]: 'Risk OFF',
  }
  return map[score] ?? 'Neutral'
}

function getPortfolioAction(score: number): PortfolioAction {
  const map: Record<number, PortfolioAction> = {
    3: 'Max equity, add beta',
    2: 'Full allocation',
    1: 'Add selectively',
    0: 'Hold / rebalance',
    [-1]: 'Reduce weak assets',
    [-2]: 'Increase defensive yield',
    [-3]: 'Cut equity, preserve capital',
  }
  return map[score] ?? 'Hold / rebalance'
}

function getAllocation(score: number): PortfolioAllocation {
  const map: Record<number, PortfolioAllocation> = {
    3: { growth: 85, defensive: 15 },
    2: { growth: 75, defensive: 25 },
    1: { growth: 70, defensive: 30 },
    0: { growth: 65, defensive: 35 },
    [-1]: { growth: 60, defensive: 40 },
    [-2]: { growth: 50, defensive: 50 },
    [-3]: { growth: 40, defensive: 60 },
  }
  return map[score] ?? { growth: 65, defensive: 35 }
}

function getClientText(score: number): string {
  if (score >= 2) return 'We are positioned for growth.'
  if (score === 1) return 'We are cautiously increasing risk.'
  if (score === 0) return 'We are maintaining balance.'
  if (score === -1) return 'We are reducing weaker exposures.'
  return 'We are positioning defensively.'
}

function clampScore(score: number): number {
  return Math.max(-3, Math.min(3, score))
}
