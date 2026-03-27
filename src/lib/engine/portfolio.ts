/**
 * PMW Phase 2 — Portfolio Allocator
 *
 * Takes an engine result (specifically the Growth/Defensive split) and a
 * client's current fund holdings, then produces per-fund recommended weights
 * scaled to hit the target allocation.
 *
 * Pure function — no side effects, fully testable.
 */

import type {
  PortfolioFund,
  FundAllocation,
  ClientPortfolioResult,
  PortfolioAllocation,
} from '@/types/engine'

const REBALANCE_THRESHOLD = 2 // % — delta below this = hold

/**
 * Scale each fund's weight so that the sum of growth weights matches
 * targetGrowth and the sum of defensive weights matches targetDefensive.
 */
export function allocatePortfolio(
  clientName: string,
  funds: PortfolioFund[],
  target: PortfolioAllocation,
): ClientPortfolioResult {
  const growthFunds = funds.filter((f) => f.category === 'growth')
  const defensiveFunds = funds.filter((f) => f.category === 'defensive')

  const currentGrowth = sumWeights(growthFunds)
  const currentDefensive = sumWeights(defensiveFunds)

  // Scale each category's weights proportionally to hit the target split.
  // If a category has no funds, their target weight stays unallocated.
  const allocatedFunds: FundAllocation[] = funds.map((fund) => {
    const categoryTotal =
      fund.category === 'growth' ? currentGrowth : currentDefensive
    const categoryTarget =
      fund.category === 'growth' ? target.growth : target.defensive

    // Proportional scaling — keeps relative fund weights within category
    const recommendedWeight =
      categoryTotal > 0
        ? round2((fund.currentWeight / categoryTotal) * categoryTarget)
        : round2(categoryTarget / Math.max(1, funds.filter((f) => f.category === fund.category).length))

    const delta = round2(recommendedWeight - fund.currentWeight)
    const action =
      Math.abs(delta) < REBALANCE_THRESHOLD
        ? 'hold'
        : delta > 0
          ? 'increase'
          : 'decrease'

    return { ...fund, recommendedWeight, delta, action }
  })

  const rebalanceRequired = allocatedFunds.some((f) => f.action !== 'hold')

  return {
    clientName,
    funds: allocatedFunds,
    targetGrowth: target.growth,
    targetDefensive: target.defensive,
    currentGrowth: round2(currentGrowth),
    currentDefensive: round2(currentDefensive),
    rebalanceRequired,
  }
}

function sumWeights(funds: PortfolioFund[]): number {
  return funds.reduce((acc, f) => acc + f.currentWeight, 0)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
