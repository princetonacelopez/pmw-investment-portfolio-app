import { Separator } from '@/components/ui/separator'
import { RegimePanel } from '@/components/engine/RegimePanel'
import { MomentumPanel } from '@/components/engine/MomentumPanel'
import { FundamentalsPanel } from '@/components/engine/FundamentalsPanel'
import { DecisionOutput } from '@/components/engine/DecisionOutput'
import { RunEngineButton } from '@/components/engine/RunEngineButton'
import { SP500DMAToggle } from '@/components/engine/SP500DMAToggle'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm tracking-tight">PMW</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">
              R+M+F Decision Engine
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Phase 1 — Manual Inputs
          </span>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* Left column — inputs */}
          <div className="space-y-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Market Inputs
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure the three pillars to generate the portfolio decision.
              </p>
            </div>

            <RegimePanel />
            <MomentumPanel />
            <FundamentalsPanel />

            {/* 200DMA overlay + run controls */}
            <div className="bg-card border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SP500DMAToggle />
              <RunEngineButton />
            </div>
          </div>

          {/* Right column — output */}
          <aside className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Decision Output
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Portfolio signal, action, and allocation.
              </p>
            </div>
            <DecisionOutput />
          </aside>
        </div>
      </main>
    </div>
  )
}
