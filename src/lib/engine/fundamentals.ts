import type {
  FundamentalsFactors,
  FundamentalsLabel,
  FundamentalsResult,
  Signal,
} from '@/types/engine'

/**
 * Calculates the Fundamentals (Valuation) score from 3 factors.
 * Each factor is scored 0 / 0.5 / 1 per the PMW spec.
 * Average of all three factors = fundamentals score.
 *
 * Thresholds:
 *  > 0.7      → Strong (+1)
 *  0.4 – 0.7  → Neutral (0)
 *  < 0.4      → Weak   (-1)
 */
export function calculateFundamentals(factors: FundamentalsFactors): FundamentalsResult {
  const averageScore =
    (factors.valuationVsHistory + factors.earningsTrend + factors.riskLevel) / 3

  const label: FundamentalsLabel = getFundamentalsLabel(averageScore)
  const signal: Signal = getFundamentalsSignal(label)

  return { factors, averageScore, label, signal }
}

function getFundamentalsLabel(score: number): FundamentalsLabel {
  if (score > 0.7) return 'Strong'
  if (score >= 0.4) return 'Neutral'
  return 'Weak'
}

function getFundamentalsSignal(label: FundamentalsLabel): Signal {
  if (label === 'Strong') return 1
  if (label === 'Neutral') return 0
  return -1
}
