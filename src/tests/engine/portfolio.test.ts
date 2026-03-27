import { describe, it, expect } from 'vitest'
import { allocatePortfolio } from '@/lib/engine/portfolio'
import type { PortfolioFund } from '@/types/engine'

const FUNDS: PortfolioFund[] = [
  { code: 'VAS', name: 'Vanguard Aust', category: 'growth', currentWeight: 40 },
  { code: 'IVV', name: 'iShares S&P 500', category: 'growth', currentWeight: 20 },
  { code: 'VAF', name: 'Vanguard Bonds', category: 'defensive', currentWeight: 25 },
  { code: 'CASH', name: 'Cash', category: 'defensive', currentWeight: 15 },
]
// Total: 60% growth, 40% defensive

describe('allocatePortfolio', () => {
  it('scales growth funds proportionally to hit target', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 75, defensive: 25 })

    // Growth funds: VAS was 40/60 = 66.7% of growth, IVV was 20/60 = 33.3%
    // At 75% target: VAS → 75 * 0.667 ≈ 50, IVV → 75 * 0.333 ≈ 25
    const vas = result.funds.find((f) => f.code === 'VAS')!
    const ivv = result.funds.find((f) => f.code === 'IVV')!
    expect(vas.recommendedWeight).toBeCloseTo(50, 0)
    expect(ivv.recommendedWeight).toBeCloseTo(25, 0)
  })

  it('scales defensive funds proportionally to hit target', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 75, defensive: 25 })

    // Defensive: VAF was 25/40 = 62.5%, CASH was 15/40 = 37.5%
    // At 25% target: VAF → 25 * 0.625 ≈ 15.63, CASH → 25 * 0.375 ≈ 9.38
    const vaf = result.funds.find((f) => f.code === 'VAF')!
    const cash = result.funds.find((f) => f.code === 'CASH')!
    expect(vaf.recommendedWeight).toBeCloseTo(15.63, 1)
    expect(cash.recommendedWeight).toBeCloseTo(9.38, 1)
  })

  it('marks funds with delta < 2% as hold', () => {
    // At 60/40 target (same as current) — all deltas should be ~0
    const result = allocatePortfolio('Test', FUNDS, { growth: 60, defensive: 40 })
    result.funds.forEach((f) => {
      expect(f.action).toBe('hold')
      expect(f.delta).toBeCloseTo(0, 1)
    })
  })

  it('marks rebalanceRequired=true when deltas exceed threshold', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 85, defensive: 15 })
    expect(result.rebalanceRequired).toBe(true)
  })

  it('marks rebalanceRequired=false when on target', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 60, defensive: 40 })
    expect(result.rebalanceRequired).toBe(false)
  })

  it('correctly identifies increase actions', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 85, defensive: 15 })
    const growthFunds = result.funds.filter((f) => f.category === 'growth')
    growthFunds.forEach((f) => expect(f.action).toBe('increase'))
  })

  it('correctly identifies decrease actions', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 85, defensive: 15 })
    const defensiveFunds = result.funds.filter((f) => f.category === 'defensive')
    defensiveFunds.forEach((f) => expect(f.action).toBe('decrease'))
  })

  it('preserves client name', () => {
    const result = allocatePortfolio('Acme Family Trust', FUNDS, { growth: 65, defensive: 35 })
    expect(result.clientName).toBe('Acme Family Trust')
  })

  it('stores target allocation on result', () => {
    const result = allocatePortfolio('Test', FUNDS, { growth: 70, defensive: 30 })
    expect(result.targetGrowth).toBe(70)
    expect(result.targetDefensive).toBe(30)
  })
})
