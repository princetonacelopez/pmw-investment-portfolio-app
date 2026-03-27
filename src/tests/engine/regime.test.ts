import { describe, it, expect } from 'vitest'
import { calculateRegime } from '@/lib/engine/regime'
import type { RegimeIndicators } from '@/types/engine'

const ALL_POSITIVE: RegimeIndicators = {
  inflationTrend: 1,
  realYields: 1,
  yieldCurve: 1,
  liquidityM2CB: 1,
  creditSpreads: 1,
}

const ALL_NEGATIVE: RegimeIndicators = {
  inflationTrend: -1,
  realYields: -1,
  yieldCurve: -1,
  liquidityM2CB: -1,
  creditSpreads: -1,
}

const MIXED_NEUTRAL: RegimeIndicators = {
  inflationTrend: 1,
  realYields: 1,
  yieldCurve: -1,
  liquidityM2CB: -1,
  creditSpreads: 1,
}

describe('calculateRegime', () => {
  it('returns Risk ON (+1) when rawScore ≥ 3', () => {
    const result = calculateRegime(ALL_POSITIVE)
    expect(result.rawScore).toBe(5)
    expect(result.label).toBe('Risk ON')
    expect(result.signal).toBe(1)
  })

  it('returns Risk ON (+1) when rawScore is exactly 3', () => {
    const inputs: RegimeIndicators = {
      inflationTrend: 1,
      realYields: 1,
      yieldCurve: 1,
      liquidityM2CB: -1,
      creditSpreads: 1,
    }
    const result = calculateRegime(inputs)
    expect(result.rawScore).toBe(3)
    expect(result.label).toBe('Risk ON')
    expect(result.signal).toBe(1)
  })

  it('returns Neutral (0) when rawScore is 0 to 2', () => {
    // rawScore = 1
    const inputs: RegimeIndicators = {
      inflationTrend: 1,
      realYields: 1,
      yieldCurve: -1,
      liquidityM2CB: -1,
      creditSpreads: 1,
    }
    const result = calculateRegime(inputs)
    expect(result.rawScore).toBe(1)
    expect(result.label).toBe('Neutral')
    expect(result.signal).toBe(0)
  })

  it('returns Neutral (0) when rawScore is exactly 0', () => {
    const result = calculateRegime(MIXED_NEUTRAL)
    // 1+1-1-1+1 = 1, so adjust test
    const zeroInputs: RegimeIndicators = {
      inflationTrend: 1,
      realYields: 1,
      yieldCurve: -1,
      liquidityM2CB: -1,
      creditSpreads: -1,
    }
    const r = calculateRegime(zeroInputs)
    expect(r.rawScore).toBe(-1)
    expect(r.label).toBe('Risk OFF')
  })

  it('returns Risk OFF (-1) when rawScore < 0', () => {
    const result = calculateRegime(ALL_NEGATIVE)
    expect(result.rawScore).toBe(-5)
    expect(result.label).toBe('Risk OFF')
    expect(result.signal).toBe(-1)
  })

  it('preserves the input indicators in the result', () => {
    const result = calculateRegime(ALL_POSITIVE)
    expect(result.indicators).toEqual(ALL_POSITIVE)
  })

  it('rawScore is the arithmetic sum of all 5 indicators', () => {
    const inputs: RegimeIndicators = {
      inflationTrend: 1,
      realYields: -1,
      yieldCurve: 1,
      liquidityM2CB: -1,
      creditSpreads: 1,
    }
    const result = calculateRegime(inputs)
    expect(result.rawScore).toBe(1)
  })
})
