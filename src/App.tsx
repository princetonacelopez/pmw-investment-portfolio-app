import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { RegimePanel } from '@/components/engine/RegimePanel'
import { MomentumPanel } from '@/components/engine/MomentumPanel'
import { FundamentalsPanel } from '@/components/engine/FundamentalsPanel'
import { DecisionOutput } from '@/components/engine/DecisionOutput'
import { RunEngineButton } from '@/components/engine/RunEngineButton'
import { SP500DMAToggle } from '@/components/engine/SP500DMAToggle'
import { PortfolioAllocator } from '@/components/engine/PortfolioAllocator'
import { TranchePlan } from '@/components/engine/TranchePlan'
import { ClientOutput } from '@/components/engine/ClientOutput'
import { EngineHistory } from '@/components/engine/EngineHistory'

// ── Tab config ────────────────────────────────────────────────────────────────

type RightTab = 'decision' | 'portfolio' | 'tranche' | 'client' | 'history'

const RIGHT_TABS: { id: RightTab; label: string; title: string; subtitle: string }[] = [
  {
    id: 'decision',
    label: 'Decision',
    title: 'Decision Output',
    subtitle: 'Portfolio signal, action, and allocation.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    title: 'Portfolio Allocator',
    subtitle: 'Fund-level rebalancing recommendations.',
  },
  {
    id: 'tranche',
    label: 'Tranche',
    title: 'Tranche Deployment',
    subtitle: '4-tranche schedule when conditions are met.',
  },
  {
    id: 'client',
    label: 'Client',
    title: 'Client Communication',
    subtitle: 'Adviser-ready text to share with clients.',
  },
  {
    id: 'history',
    label: 'History',
    title: 'Engine Run History',
    subtitle: 'Audit trail of all engine runs.',
  },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<RightTab>('decision')
  const current = RIGHT_TABS.find((t) => t.id === activeTab)!

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
            Phase 2 — Portfolio &amp; Client Layer
          </span>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

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

          {/* Right column — tabbed output */}
          <aside className="space-y-4">
            {/* Tab bar */}
            <nav
              aria-label="Output views"
              className="flex gap-1 bg-muted/50 rounded-lg p-1"
            >
              {RIGHT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex-1 text-xs font-medium px-1.5 py-1.5 rounded-md transition-all',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab header */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {current.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {current.subtitle}
              </p>
            </div>

            {/* Tab content */}
            <div role="tabpanel" aria-label={current.title}>
              {activeTab === 'decision' && <DecisionOutput />}
              {activeTab === 'portfolio' && <PortfolioAllocator />}
              {activeTab === 'tranche' && <TranchePlan />}
              {activeTab === 'client' && <ClientOutput />}
              {activeTab === 'history' && <EngineHistory />}
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}
