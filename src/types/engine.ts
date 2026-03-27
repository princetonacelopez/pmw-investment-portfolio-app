// ─────────────────────────────────────────────────────────────────────────────
// PMW R+M+F Decision Engine — Core Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ────────────────────────────────────────────────────────

/** Binary score for Regime indicators: +1 (positive condition) or -1 (negative) */
export type BinaryScore = 1 | -1

/** Ternary score for Fundamentals factors: 1 (good), 0.5 (neutral), 0 (bad) */
export type TernaryScore = 1 | 0.5 | 0

/** Converted signal after thresholding any module score */
export type Signal = 1 | 0 | -1

// ── Regime Module ─────────────────────────────────────────────────────────────

export interface RegimeIndicators {
  inflationTrend: BinaryScore    // +1 Falling, -1 Rising
  realYields: BinaryScore        // +1 Falling, -1 Rising
  yieldCurve: BinaryScore        // +1 Steepening, -1 Inverted
  liquidityM2CB: BinaryScore     // +1 Expanding, -1 Tightening
  creditSpreads: BinaryScore     // +1 Tight, -1 Widening
}

export type RegimeLabel = 'Risk ON' | 'Neutral' | 'Risk OFF'

export interface RegimeResult {
  indicators: RegimeIndicators
  rawScore: number               // sum of 5 indicators (-5 to +5)
  label: RegimeLabel
  signal: Signal                 // +1 Risk ON, 0 Neutral, -1 Risk OFF
}

// ── Momentum Module ───────────────────────────────────────────────────────────

export type MomentumAsset = 'SP500' | 'NASDAQ' | 'SOXX'

export interface AssetMomentumInput {
  asset: MomentumAsset
  return6M: number               // decimal e.g. 0.12 = 12%
  return12M: number
  above200DMA: boolean           // true = +1, false = -1
}

export type MomentumLabel = 'Strong' | 'Neutral' | 'Weak'

export interface MomentumResult {
  inputs: AssetMomentumInput[]
  weightedScore: number          // normalised weighted score
  label: MomentumLabel
  signal: Signal
}

// ── Fundamentals Module ───────────────────────────────────────────────────────

export interface FundamentalsFactors {
  valuationVsHistory: TernaryScore   // Cheap=1, Fair=0.5, Expensive=0
  earningsTrend: TernaryScore        // Rising=1, Flat=0.5, Falling=0
  riskLevel: TernaryScore            // Low=1, Medium=0.5, High=0
}

export type FundamentalsLabel = 'Strong' | 'Neutral' | 'Weak'

export interface FundamentalsResult {
  factors: FundamentalsFactors
  averageScore: number               // 0 to 1
  label: FundamentalsLabel
  signal: Signal
}

// ── Decision Engine Output ────────────────────────────────────────────────────

export type DecisionSignal =
  | 'Aggressive Risk ON'
  | 'Risk ON'
  | 'Mild Risk ON'
  | 'Neutral'
  | 'Caution'
  | 'Defensive'
  | 'Risk OFF'

export type PortfolioAction =
  | 'Max equity, add beta'
  | 'Full allocation'
  | 'Add selectively'
  | 'Hold / rebalance'
  | 'Reduce weak assets'
  | 'Increase defensive yield'
  | 'Cut equity, preserve capital'

export interface PortfolioAllocation {
  growth: number       // percentage 0-100
  defensive: number    // percentage 0-100
}

export interface TrancheSchedule {
  trancheActive: true
  schedule: ['25% now', '25% lower', '25% stabilisation', '25% breakout']
}

export interface EngineResult {
  // Pillar results
  regime: RegimeResult
  momentum: MomentumResult
  fundamentals: FundamentalsResult

  // Composite
  baseScore: number              // R + M + F before overlay (-3 to +3)
  adjustedScore: number         // after 200DMA overlay (-3 to +3)
  dmaOverlayApplied: boolean    // was S&P below 200DMA?

  // Decision
  signal: DecisionSignal
  portfolioAction: PortfolioAction
  allocation: PortfolioAllocation

  // Tranche logic
  tranche: TrancheSchedule | { trancheActive: false }

  // Client-facing text
  clientText: string

  // Audit
  calculatedAt: string           // ISO timestamp
}

// ── Snapshot (persisted to Supabase) ─────────────────────────────────────────

export interface EngineSnapshot {
  id: string
  regime_signal: Signal
  regime_raw_score: number
  momentum_signal: Signal
  momentum_score: number
  fundamentals_signal: Signal
  fundamentals_score: number
  base_score: number
  adjusted_score: number
  dma_overlay_applied: boolean
  tranche_active: boolean
  signal: DecisionSignal
  portfolio_action: PortfolioAction
  allocation_growth: number
  allocation_defensive: number
  client_text: string
  inputs_json: unknown           // full EngineResult inputs as JSON
  created_at: string
}
