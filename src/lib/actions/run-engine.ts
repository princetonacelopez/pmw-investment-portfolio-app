import { engineSubmissionSchema } from '@/lib/validators/engine'
import {
  calculateRegime,
  calculateMomentum,
  calculateFundamentals,
  runDecisionEngine,
} from '@/lib/engine'
import { createClient } from '@/lib/supabase/client'
import type { EngineResult } from '@/types/engine'
import type { z } from 'zod'

export type RunEngineInput = z.infer<typeof engineSubmissionSchema>

export interface RunEngineResult {
  data?: EngineResult
  error?: string
}

/**
 * Run the R+M+F Decision Engine.
 *
 * Validates inputs via Zod, runs pure calculation functions,
 * persists snapshot to Supabase, and returns the full EngineResult.
 * Runs entirely in the browser — no server required.
 */
export async function runEngine(input: RunEngineInput): Promise<RunEngineResult> {
  // Validate
  const parsed = engineSubmissionSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Validation error — check all inputs are filled correctly.' }
  }

  const { regime, momentum, fundamentals, sp500Above200DMA } = parsed.data

  // Run pure engine calculations
  const regimeResult = calculateRegime(regime)
  const momentumResult = calculateMomentum(momentum)
  const fundamentalsResult = calculateFundamentals(fundamentals)
  const engineResult = runDecisionEngine(
    regimeResult,
    momentumResult,
    fundamentalsResult,
    sp500Above200DMA,
  )

  // Persist to Supabase (audit trail — AFSL requirement)
  const supabase = createClient()
  const { error } = await supabase.from('engine_snapshots').insert({
    regime_signal: engineResult.regime.signal,
    regime_raw_score: engineResult.regime.rawScore,
    momentum_signal: engineResult.momentum.signal,
    momentum_score: engineResult.momentum.weightedScore,
    fundamentals_signal: engineResult.fundamentals.signal,
    fundamentals_score: engineResult.fundamentals.averageScore,
    base_score: engineResult.baseScore,
    adjusted_score: engineResult.adjustedScore,
    dma_overlay_applied: engineResult.dmaOverlayApplied,
    tranche_active: engineResult.tranche.trancheActive,
    signal: engineResult.signal,
    portfolio_action: engineResult.portfolioAction,
    allocation_growth: engineResult.allocation.growth,
    allocation_defensive: engineResult.allocation.defensive,
    client_text: engineResult.clientText,
    inputs_json: parsed.data,
  })

  if (error !== null) {
    console.warn('Failed to persist engine snapshot:', error.message)
    // Non-fatal — return result even if persistence fails
  }

  return { data: engineResult }
}
