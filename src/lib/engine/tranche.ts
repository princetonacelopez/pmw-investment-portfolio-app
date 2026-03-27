/**
 * PMW Phase 2 — Tranche Deployment Plan Builder
 *
 * When Momentum = Weak AND Regime ≠ Strong, the engine triggers tranche
 * deployment: 25% now, 25% at lower prices, 25% on stabilisation, 25% on breakout.
 *
 * This module expands that into a full plan with descriptions and conditions.
 */

import type { TranchePlan, TrancheEntry } from '@/types/engine'
import type { MomentumLabel, RegimeLabel } from '@/types/engine'

const TRANCHE_DEFINITIONS: Omit<TrancheEntry, 'status'>[] = [
  {
    tranche: 1,
    label: '25% Now',
    description: 'Initiate first position at current market prices.',
    condition: 'Triggered immediately when tranche logic activates.',
  },
  {
    tranche: 2,
    label: '25% Lower',
    description: 'Add second tranche if the market dips a further 3–5%.',
    condition: 'Price declines below entry point by ≥3%.',
  },
  {
    tranche: 3,
    label: '25% Stabilisation',
    description: 'Add third tranche once price action stabilises and momentum turns flat.',
    condition: 'Momentum score crosses from negative to neutral (≥0).',
  },
  {
    tranche: 4,
    label: '25% Breakout',
    description: 'Deploy final tranche on confirmed upside breakout above resistance.',
    condition: 'Price breaks above 200DMA with improving momentum.',
  },
]

/**
 * Build a full tranche plan from engine pillar outputs.
 *
 * Tranche condition: Momentum = Weak AND Regime ≠ Risk ON
 */
export function buildTranchePlan(
  momentumLabel: MomentumLabel,
  regimeLabel: RegimeLabel,
): TranchePlan {
  const trancheActive = momentumLabel === 'Weak' && regimeLabel !== 'Risk ON'

  if (!trancheActive) {
    return {
      trancheActive: false,
      reason: '',
      entries: [],
    }
  }

  const reason = buildReason(momentumLabel, regimeLabel)

  const entries: TrancheEntry[] = TRANCHE_DEFINITIONS.map((def) => ({
    ...def,
    // Tranche 1 is always active when triggered; others are pending
    status: def.tranche === 1 ? 'active' : 'pending',
  }))

  return { trancheActive: true, reason, entries }
}

function buildReason(momentumLabel: MomentumLabel, regimeLabel: RegimeLabel): string {
  return `Tranche deployment triggered — Momentum is ${momentumLabel} and Regime is ${regimeLabel}. Dollar-cost averaging across 4 tranches reduces timing risk.`
}
