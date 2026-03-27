import { describe, it, expect } from 'vitest'
import { generateClientOutput } from '@/lib/engine/client-output'
import type { EngineResult } from '@/types/engine'

// Minimal EngineResult stub
function makeResult(signal: EngineResult['signal'], score: number): EngineResult {
  return {
    regime: { indicators: {} as never, rawScore: 3, label: 'Risk ON', signal: 1 },
    momentum: { inputs: [], weightedScore: 0.6, label: 'Strong', signal: 1 },
    fundamentals: { factors: {} as never, averageScore: 0.8, label: 'Strong', signal: 1 },
    baseScore: score,
    adjustedScore: score,
    dmaOverlayApplied: false,
    signal,
    portfolioAction: 'Full allocation',
    allocation: { growth: 75, defensive: 25 },
    tranche: { trancheActive: false },
    clientText: '',
    calculatedAt: new Date().toISOString(),
  }
}

describe('generateClientOutput', () => {
  it('returns the correct signal and score', () => {
    const out = generateClientOutput(makeResult('Risk ON', 2))
    expect(out.signal).toBe('Risk ON')
    expect(out.score).toBe(2)
  })

  it('returns a non-empty headline', () => {
    const out = generateClientOutput(makeResult('Neutral', 0))
    expect(out.headline.length).toBeGreaterThan(10)
  })

  it('returns a non-empty body', () => {
    const out = generateClientOutput(makeResult('Caution', -1))
    expect(out.body.length).toBeGreaterThan(20)
  })

  it('returns exactly 3 bullet points', () => {
    const signals: EngineResult['signal'][] = [
      'Aggressive Risk ON', 'Risk ON', 'Mild Risk ON',
      'Neutral', 'Caution', 'Defensive', 'Risk OFF',
    ]
    signals.forEach((s) => {
      const out = generateClientOutput(makeResult(s, 0))
      expect(out.bulletPoints).toHaveLength(3)
    })
  })

  it('includes AFSL disclaimer', () => {
    const out = generateClientOutput(makeResult('Risk OFF', -3))
    expect(out.disclaimer).toContain('AFSL')
  })

  it('returns a valid ISO timestamp', () => {
    const out = generateClientOutput(makeResult('Neutral', 0))
    expect(() => new Date(out.generatedAt).toISOString()).not.toThrow()
  })

  it('produces unique content for Risk ON vs Risk OFF', () => {
    const on = generateClientOutput(makeResult('Risk ON', 2))
    const off = generateClientOutput(makeResult('Risk OFF', -3))
    expect(on.headline).not.toBe(off.headline)
    expect(on.body).not.toBe(off.body)
  })
})
