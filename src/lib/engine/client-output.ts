/**
 * PMW Phase 2 — Client Output Generator
 *
 * Produces adviser-ready communication text from the engine result.
 * All copy is PMW-branded and AFSL-aware (general advice disclaimer included).
 */

import type { ClientOutput, DecisionSignal, EngineResult } from '@/types/engine'

// ── Signal copy map ──────────────────────────────────────────────────────────

interface SignalCopy {
  headline: string
  body: string
  bulletPoints: string[]
}

const SIGNAL_COPY: Record<DecisionSignal, SignalCopy> = {
  'Aggressive Risk ON': {
    headline: 'Full growth positioning — markets are strongly aligned.',
    body:
      'All three pillars — macro regime, momentum, and fundamentals — are firing positive signals simultaneously. This is the highest-conviction environment for growth assets. We are maximising equity exposure and adding beta across client portfolios.',
    bulletPoints: [
      'Increase equity allocation to maximum target weight (85% growth).',
      'Add higher-beta positions across growth sectors.',
      'Review defensive holdings for potential reduction.',
    ],
  },
  'Risk ON': {
    headline: 'Growth environment — fully allocated to risk assets.',
    body:
      'The macro backdrop and market momentum are both constructive. We are maintaining full allocation to growth assets with confidence in the current trend continuing.',
    bulletPoints: [
      'Maintain full growth allocation (75% growth / 25% defensive).',
      'Continue adding quality growth positions on dips.',
      'Monitor for any deterioration in regime indicators.',
    ],
  },
  'Mild Risk ON': {
    headline: 'Cautiously constructive — adding risk selectively.',
    body:
      'Conditions are modestly positive but not uniformly aligned. We are increasing growth exposure selectively, prioritising quality and avoiding speculative positions until signals strengthen.',
    bulletPoints: [
      'Tilt slightly toward growth assets (70/30 split).',
      'Favour quality and large-cap over speculative positions.',
      'Maintain watch list for opportunities on weakness.',
    ],
  },
  Neutral: {
    headline: 'Balanced positioning — holding steady.',
    body:
      'The market is sending mixed signals across our three pillars. We are maintaining a balanced portfolio and avoiding major allocation shifts until a clearer directional signal emerges.',
    bulletPoints: [
      'Hold current allocation near 65% growth / 35% defensive.',
      'Rebalance portfolios that have drifted from target weights.',
      'Increase cash or short-duration bonds as a buffer.',
    ],
  },
  Caution: {
    headline: 'Caution warranted — reducing weaker exposures.',
    body:
      'At least one pillar is showing weakness. We are trimming positions in underperforming areas and increasing defensive exposure to protect client capital while remaining invested.',
    bulletPoints: [
      'Reduce exposure to weak or high-beta positions.',
      'Increase defensive and income-generating assets (60/40 split).',
      'Review stop-loss levels on existing growth positions.',
    ],
  },
  Defensive: {
    headline: 'Defensive positioning — preserving capital.',
    body:
      'Two or more pillars are signalling deterioration. We are shifting portfolios toward defensive assets, income securities, and capital preservation to protect against further downside.',
    bulletPoints: [
      'Shift to 50% defensive assets — bonds, cash, income ETFs.',
      'Reduce or hedge high-beta equity exposure.',
      'Hold elevated cash as dry powder for redeployment.',
    ],
  },
  'Risk OFF': {
    headline: 'Risk OFF — cutting equity, preserving capital.',
    body:
      'All three pillars are aligned negatively. This is the highest risk environment and we are taking decisive action to reduce equity exposure and protect client capital.',
    bulletPoints: [
      'Cut equity to minimum target (40% growth / 60% defensive).',
      'Move to cash, government bonds, and gold as safe havens.',
      'Suspend new growth purchases until regime signals improve.',
    ],
  },
}

const DISCLAIMER =
  'This communication contains general financial advice only and does not take into account your individual objectives, financial situation or needs. Before acting on this information, please consider whether it is appropriate for you. Past performance is not a reliable indicator of future performance. PlanMyWealth Pty Ltd holds an Australian Financial Services Licence (AFSL).'

// ── Generator ────────────────────────────────────────────────────────────────

export function generateClientOutput(result: EngineResult): ClientOutput {
  const copy = SIGNAL_COPY[result.signal]

  return {
    signal: result.signal,
    score: result.adjustedScore,
    headline: copy.headline,
    body: copy.body,
    bulletPoints: copy.bulletPoints,
    disclaimer: DISCLAIMER,
    generatedAt: new Date().toISOString(),
  }
}
