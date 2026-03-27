import { describe, it, expect } from 'vitest'
import { calculateFundamentals } from '@/lib/engine/fundamentals'
import type { FundamentalsFactors } from '@/types/engine'

const ALL_STRONG: FundamentalsFactors = {
  valuationVsHistory: 1,
  earningsTrend: 1,
  riskLevel: 1,
}

const ALL_WEAK: FundamentalsFactors = {
  valuationVsHistory: 0,
  earningsTrend: 0,
  riskLevel: 0,
}

const ALL_NEUTRAL: FundamentalsFactors = {
  valuationVsHistory: 0.5,
  earningsTrend: 0.5,
  riskLevel: 0.5,
}

describe('calculateFundamentals', () => {
  it('returns Strong signal (+1) when averageScore > 0.7', () => {
    const result = calculateFundamentals(ALL_STRONG)
    expect(result.averageScore).toBe(1)
    expect(result.label).toBe('Strong')
    expect(result.signal).toBe(1)
  })

  it('returns Weak signal (-1) when averageScore < 0.4', () => {
    const result = calculateFundamentals(ALL_WEAK)
    expect(result.averageScore).toBe(0)
    expect(result.label).toBe('Weak')
    expect(result.signal).toBe(-1)
  })

  it('returns Neutral signal (0) when averageScore is 0.4–0.7 (inclusive)', () => {
    const result = calculateFundamentals(ALL_NEUTRAL)
    expect(result.averageScore).toBeCloseTo(0.5)
    expect(result.label).toBe('Neutral')
    expect(result.signal).toBe(0)
  })

  it('averageScore is the arithmetic mean of the three factors', () => {
    const inputs: FundamentalsFactors = {
      valuationVsHistory: 1,
      earningsTrend: 0.5,
      riskLevel: 0,
    }
    const result = calculateFundamentals(inputs)
    // (1 + 0.5 + 0) / 3 = 0.5
    expect(result.averageScore).toBeCloseTo(0.5)
  })

  it('preserves input factors in the result', () => {
    const result = calculateFundamentals(ALL_STRONG)
    expect(result.factors).toEqual(ALL_STRONG)
  })

  it('boundary: averageScore exactly 0.7 is Neutral (threshold is > 0.7 for Strong)', () => {
    // (1 + 0.5 + 0.5) / 3 = 2/3 ≈ 0.667 → Neutral
    // (1 + 1 + 0.5) / 3 = 2.5/3 ≈ 0.833 → Strong
    // Need exactly 0.7: not achievable with TernaryScore {0, 0.5, 1} so test nearest cases
    const nearlyStrong: FundamentalsFactors = {
      valuationVsHistory: 1,
      earningsTrend: 1,
      riskLevel: 0.5,
    }
    const r = calculateFundamentals(nearlyStrong)
    // (1+1+0.5)/3 = 0.833 → Strong
    expect(r.label).toBe('Strong')
    expect(r.averageScore).toBeGreaterThan(0.7)
  })

  it('boundary: averageScore 0.4 is Neutral (threshold is >= 0.4)', () => {
    // (0 + 0.5 + 0.5) / 3 = 1/3 ≈ 0.333 → Weak
    // (0.5 + 0.5 + 0.5) / 3 = 0.5 → Neutral
    const neutralLow: FundamentalsFactors = {
      valuationVsHistory: 0.5,
      earningsTrend: 0.5,
      riskLevel: 0.5,
    }
    const r = calculateFundamentals(neutralLow)
    expect(r.label).toBe('Neutral')

    // Test score below 0.4
    const weakInputs: FundamentalsFactors = {
      valuationVsHistory: 0,
      earningsTrend: 0,
      riskLevel: 0.5,
    }
    const rWeak = calculateFundamentals(weakInputs)
    expect(rWeak.averageScore).toBeCloseTo(0.1667, 2)
    expect(rWeak.label).toBe('Weak')
  })
})
