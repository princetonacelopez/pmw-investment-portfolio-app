import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { allocatePortfolio } from '@/lib/engine/portfolio'
import { useEngineStore } from '@/store/engine-store'
import type { PortfolioFund, FundAllocation, ClientPortfolioResult } from '@/types/engine'

// ── Demo portfolio seed (adviser can edit in future phases) ──────────────────

const DEMO_PORTFOLIO: PortfolioFund[] = [
  { code: 'VAS', name: 'Vanguard Australian Shares', category: 'growth', currentWeight: 20 },
  { code: 'IVV', name: 'iShares S&P 500 ETF', category: 'growth', currentWeight: 18 },
  { code: 'VGS', name: 'Vanguard Intl Shares', category: 'growth', currentWeight: 14 },
  { code: 'NDQ', name: 'BetaShares NASDAQ 100', category: 'growth', currentWeight: 8 },
  { code: 'VAF', name: 'Vanguard Aust Fixed Interest', category: 'defensive', currentWeight: 18 },
  { code: 'VACF', name: 'Vanguard Corp Fixed Interest', category: 'defensive', currentWeight: 10 },
  { code: 'GOLD', name: 'BetaShares Physical Gold', category: 'defensive', currentWeight: 7 },
  { code: 'CASH', name: 'Cash / High Interest Account', category: 'defensive', currentWeight: 5 },
]

// ── Component ────────────────────────────────────────────────────────────────

export function PortfolioAllocator() {
  const { engineResult } = useEngineStore()
  const [clientName] = useState('Model Portfolio')

  if (!engineResult) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <div className="text-3xl" aria-hidden="true">📋</div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Run the engine to see portfolio allocation recommendations.
          </p>
        </CardContent>
      </Card>
    )
  }

  const result = allocatePortfolio(clientName, DEMO_PORTFOLIO, engineResult.allocation)

  return (
    <div className="space-y-3">
      <PortfolioSummaryCard result={result} />
      <FundTable result={result} />
    </div>
  )
}

// ── Summary card ─────────────────────────────────────────────────────────────

function PortfolioSummaryCard({ result }: { result: ClientPortfolioResult }) {
  const { targetGrowth, targetDefensive, currentGrowth, currentDefensive, rebalanceRequired } = result

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{result.clientName}</CardTitle>
          <Badge
            className={
              rebalanceRequired
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-0'
                : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-0'
            }
          >
            {rebalanceRequired ? 'Rebalance Required' : 'On Target'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current vs Target comparison */}
        <div className="grid grid-cols-2 gap-4">
          <AllocationColumn
            label="Current"
            growth={currentGrowth}
            defensive={currentDefensive}
            muted
          />
          <AllocationColumn
            label="Target"
            growth={targetGrowth}
            defensive={targetDefensive}
          />
        </div>

        {/* Stacked bar comparison */}
        <div className="space-y-2">
          <SplitBar label="Current" growth={currentGrowth} />
          <SplitBar label="Target" growth={targetGrowth} highlight />
        </div>
      </CardContent>
    </Card>
  )
}

function AllocationColumn({
  label,
  growth,
  defensive,
  muted = false,
}: {
  label: string
  growth: number
  defensive: number
  muted?: boolean
}) {
  return (
    <div className={`rounded-lg border p-3 ${muted ? 'opacity-70' : ''}`}>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            Growth
          </span>
          <span className="text-sm font-semibold tabular-nums">{growth}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
            Defensive
          </span>
          <span className="text-sm font-semibold tabular-nums">{defensive}%</span>
        </div>
      </div>
    </div>
  )
}

function SplitBar({
  label,
  growth,
  highlight = false,
}: {
  label: string
  growth: number
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-14 shrink-0">{label}</span>
      <div
        className="flex-1 h-3 rounded-full overflow-hidden flex"
        role="img"
        aria-label={`${label}: ${growth}% growth`}
      >
        <div
          className={`h-full transition-all duration-500 ${highlight ? 'bg-green-500' : 'bg-green-300 dark:bg-green-800'}`}
          style={{ width: `${growth}%` }}
        />
        <div
          className={`h-full flex-1 ${highlight ? 'bg-blue-400 dark:bg-blue-600' : 'bg-blue-200 dark:bg-blue-900'}`}
        />
      </div>
    </div>
  )
}

// ── Fund table ────────────────────────────────────────────────────────────────

function FundTable({ result }: { result: ClientPortfolioResult }) {
  const growthFunds = result.funds.filter((f) => f.category === 'growth')
  const defensiveFunds = result.funds.filter((f) => f.category === 'defensive')

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <FundGroup label="Growth" funds={growthFunds} />
        <Separator />
        <FundGroup label="Defensive" funds={defensiveFunds} />
      </CardContent>
    </Card>
  )
}

function FundGroup({ label, funds }: { label: string; funds: FundAllocation[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="space-y-1">
        {funds.map((fund) => (
          <FundRow key={fund.code} fund={fund} />
        ))}
      </div>
    </div>
  )
}

function FundRow({ fund }: { fund: FundAllocation }) {
  const actionColor =
    fund.action === 'increase'
      ? 'text-green-600 dark:text-green-400'
      : fund.action === 'decrease'
        ? 'text-red-500 dark:text-red-400'
        : 'text-muted-foreground'

  const actionIcon =
    fund.action === 'increase' ? '▲' : fund.action === 'decrease' ? '▼' : '─'

  const deltaLabel =
    fund.delta === 0
      ? '—'
      : `${fund.delta > 0 ? '+' : ''}${fund.delta}%`

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors">
      {/* Code */}
      <span className="text-xs font-mono font-semibold w-12 shrink-0 text-foreground">
        {fund.code}
      </span>

      {/* Name */}
      <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
        {fund.name}
      </span>

      {/* Current */}
      <span className="text-xs tabular-nums w-10 text-right text-muted-foreground">
        {fund.currentWeight}%
      </span>

      {/* Arrow */}
      <span className="text-muted-foreground/40 text-xs w-4 text-center">→</span>

      {/* Recommended */}
      <span className="text-xs tabular-nums font-medium w-10 text-right">
        {fund.recommendedWeight}%
      </span>

      {/* Delta */}
      <span className={`text-xs tabular-nums font-medium w-12 text-right ${actionColor}`}>
        <span aria-label={fund.action}>{actionIcon}</span>{' '}
        {deltaLabel}
      </span>
    </div>
  )
}
