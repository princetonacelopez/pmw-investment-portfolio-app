import type {
  RegimeIndicators,
  RegimeLabel,
  RegimeResult,
  Signal,
} from '@/types/engine'

/**
 * Calculates the Regime (Macro) score from 5 binary indicators.
 * Each indicator contributes +1 (positive condition) or -1 (negative condition).
 * Total raw score range: -5 to +5
 *
 * Thresholds (from PMW R+M+F Decision Engine spec):
 *  +3 to +5 → Risk ON  (+1)
 *   0 to +2 → Neutral   (0)
 *     < 0   → Risk OFF  (-1)
 */
export function calculateRegime(indicators: RegimeIndicators): RegimeResult {
  const rawScore =
    indicators.inflationTrend +
    indicators.realYields +
    indicators.yieldCurve +
    indicators.liquidityM2CB +
    indicators.creditSpreads

  const label: RegimeLabel = getRegimeLabel(rawScore)
  const signal: Signal = getRegimeSignal(label)

  return { indicators, rawScore, label, signal }
}

function getRegimeLabel(score: number): RegimeLabel {
  if (score >= 3) return 'Risk ON'
  if (score >= 0) return 'Neutral'
  return 'Risk OFF'
}

function getRegimeSignal(label: RegimeLabel): Signal {
  if (label === 'Risk ON') return 1
  if (label === 'Neutral') return 0
  return -1
}
