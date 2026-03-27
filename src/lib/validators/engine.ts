import { z } from 'zod'

// ── Primitives ────────────────────────────────────────────────────────────────

const binaryScore = z.union([z.literal(1), z.literal(-1)])
const ternaryScore = z.union([z.literal(1), z.literal(0.5), z.literal(0)])
const momentumAsset = z.enum(['SP500', 'NASDAQ', 'SOXX'])

// ── Regime ────────────────────────────────────────────────────────────────────

export const regimeIndicatorsSchema = z.object({
  inflationTrend: binaryScore,
  realYields: binaryScore,
  yieldCurve: binaryScore,
  liquidityM2CB: binaryScore,
  creditSpreads: binaryScore,
})

// ── Momentum ──────────────────────────────────────────────────────────────────

export const assetMomentumInputSchema = z.object({
  asset: momentumAsset,
  return6M: z.number().min(-1).max(5),   // decimal, e.g. 0.12 = 12%
  return12M: z.number().min(-1).max(5),
  above200DMA: z.boolean(),
})

export const momentumInputsSchema = z
  .array(assetMomentumInputSchema)
  .min(1)
  .max(3)

// ── Fundamentals ──────────────────────────────────────────────────────────────

export const fundamentalsFactorsSchema = z.object({
  valuationVsHistory: ternaryScore,
  earningsTrend: ternaryScore,
  riskLevel: ternaryScore,
})

// ── Full engine submission ────────────────────────────────────────────────────

export const engineSubmissionSchema = z.object({
  regime: regimeIndicatorsSchema,
  momentum: momentumInputsSchema,
  fundamentals: fundamentalsFactorsSchema,
  sp500Above200DMA: z.boolean(),
})

export type EngineSubmission = z.infer<typeof engineSubmissionSchema>
