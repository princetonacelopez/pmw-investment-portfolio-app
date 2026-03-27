import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { EngineResult, RegimeIndicators, AssetMomentumInput, FundamentalsFactors } from '@/types/engine'

// ── Default input values ──────────────────────────────────────────────────────

const defaultRegime: RegimeIndicators = {
  inflationTrend: 1,
  realYields: 1,
  yieldCurve: 1,
  liquidityM2CB: 1,
  creditSpreads: 1,
}

const defaultMomentum: AssetMomentumInput[] = [
  { asset: 'SP500', return6M: 0, return12M: 0, above200DMA: true },
  { asset: 'NASDAQ', return6M: 0, return12M: 0, above200DMA: true },
  { asset: 'SOXX', return6M: 0, return12M: 0, above200DMA: true },
]

const defaultFundamentals: FundamentalsFactors = {
  valuationVsHistory: 0.5,
  earningsTrend: 0.5,
  riskLevel: 0.5,
}

// ── Store interface ───────────────────────────────────────────────────────────

interface EngineStore {
  // Inputs
  regimeInputs: RegimeIndicators
  momentumInputs: AssetMomentumInput[]
  fundamentalsInputs: FundamentalsFactors
  sp500Above200DMA: boolean

  // Result
  engineResult: EngineResult | null
  isCalculating: boolean
  lastError: string | null

  // Actions — inputs
  setRegimeIndicator: (key: keyof RegimeIndicators, value: 1 | -1) => void
  setMomentumInput: (index: number, field: keyof AssetMomentumInput, value: unknown) => void
  setFundamentalsFactor: (key: keyof FundamentalsFactors, value: 1 | 0.5 | 0) => void
  setSp500Above200DMA: (value: boolean) => void

  // Actions — results
  setEngineResult: (result: EngineResult) => void
  setIsCalculating: (value: boolean) => void
  setError: (error: string | null) => void
  resetInputs: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useEngineStore = create<EngineStore>()(
  devtools(
    (set) => ({
      regimeInputs: defaultRegime,
      momentumInputs: defaultMomentum,
      fundamentalsInputs: defaultFundamentals,
      sp500Above200DMA: true,
      engineResult: null,
      isCalculating: false,
      lastError: null,

      setRegimeIndicator: (key, value) =>
        set((state) => ({
          regimeInputs: { ...state.regimeInputs, [key]: value },
        })),

      setMomentumInput: (index, field, value) =>
        set((state) => {
          const updated = [...state.momentumInputs]
          updated[index] = { ...updated[index]!, [field]: value }
          return { momentumInputs: updated }
        }),

      setFundamentalsFactor: (key, value) =>
        set((state) => ({
          fundamentalsInputs: { ...state.fundamentalsInputs, [key]: value },
        })),

      setSp500Above200DMA: (value) => set({ sp500Above200DMA: value }),

      setEngineResult: (result) => set({ engineResult: result, lastError: null }),
      setIsCalculating: (value) => set({ isCalculating: value }),
      setError: (error) => set({ lastError: error }),

      resetInputs: () =>
        set({
          regimeInputs: defaultRegime,
          momentumInputs: defaultMomentum,
          fundamentalsInputs: defaultFundamentals,
          sp500Above200DMA: true,
          engineResult: null,
          lastError: null,
        }),
    }),
    { name: 'PMW Engine Store' },
  ),
)
