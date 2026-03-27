import type {
  AssetMomentumInput,
  MomentumLabel,
  MomentumResult,
  Signal,
} from '@/types/engine'

const WEIGHT_6M = 0.4
const WEIGHT_12M = 0.4
const WEIGHT_200DMA = 0.2

/**
 * Calculates the Momentum (Trend) score from 3 assets.
 *
 * Steps (from PMW spec):
 *  1. Normalize 6M and 12M returns via rank/percentile across all inputs
 *  2. Per asset: weighted score = (0.4 × 6M) + (0.4 × 12M) + (0.2 × 200DMA signal)
 *     where 200DMA signal: above = +1, below = -1
 *  3. Average the per-asset scores
 *
 * Thresholds:
 *  > 0.5  → Strong (+1)
 *  0–0.5  → Neutral (0)
 *  < 0    → Weak   (-1)
 */
export function calculateMomentum(inputs: AssetMomentumInput[]): MomentumResult {
  if (inputs.length === 0) {
    throw new Error('Momentum calculation requires at least one asset input')
  }

  // Step 1: Normalize returns to [-1, +1] via rank percentile
  const normalized6M = normalizeReturns(inputs.map((a) => a.return6M))
  const normalized12M = normalizeReturns(inputs.map((a) => a.return12M))

  // Step 2: Compute weighted score per asset
  const perAssetScores = inputs.map((asset, i) => {
    const dmaSignal = asset.above200DMA ? 1 : -1
    const n6m = normalized6M[i] ?? 0
    const n12m = normalized12M[i] ?? 0
    return WEIGHT_6M * n6m + WEIGHT_12M * n12m + WEIGHT_200DMA * dmaSignal
  })

  // Step 3: Average
  const weightedScore =
    perAssetScores.reduce((sum, s) => sum + s, 0) / perAssetScores.length

  const label: MomentumLabel = getMomentumLabel(weightedScore)
  const signal: Signal = getMomentumSignal(label)

  return { inputs, weightedScore, label, signal }
}

/**
 * Normalizes an array of returns to percentile ranks scaled to [-1, +1].
 * Rank 0 (lowest) → -1, Rank 1 (highest) → +1
 */
function normalizeReturns(returns: number[]): number[] {
  if (returns.length === 1) {
    // Single asset — treat as neutral reference
    return [0]
  }

  const sorted = [...returns].sort((a, b) => a - b)

  return returns.map((r) => {
    const rank = sorted.indexOf(r) / (sorted.length - 1) // 0 to 1
    return rank * 2 - 1 // scale to -1 to +1
  })
}

function getMomentumLabel(score: number): MomentumLabel {
  if (score > 0.5) return 'Strong'
  if (score >= 0) return 'Neutral'
  return 'Weak'
}

function getMomentumSignal(label: MomentumLabel): Signal {
  if (label === 'Strong') return 1
  if (label === 'Neutral') return 0
  return -1
}
