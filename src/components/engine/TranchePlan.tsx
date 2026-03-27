import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buildTranchePlan } from '@/lib/engine/tranche'
import { useEngineStore } from '@/store/engine-store'
import type { TrancheEntry } from '@/types/engine'

export function TranchePlan() {
  const { engineResult } = useEngineStore()

  if (!engineResult) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <div className="text-3xl" aria-hidden="true">📐</div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Run the engine to check for tranche deployment conditions.
          </p>
        </CardContent>
      </Card>
    )
  }

  const plan = buildTranchePlan(
    engineResult.momentum.label,
    engineResult.regime.label,
  )

  if (!plan.trancheActive) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <div className="text-3xl" aria-hidden="true">✅</div>
          <p className="text-sm font-medium">No tranche deployment needed.</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Momentum and regime conditions do not trigger the tranche rule. Deploy
            capital normally.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Trigger reason banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-4 py-3">
        <div className="flex gap-2 items-start">
          <span className="text-amber-500 text-base shrink-0 mt-0.5" aria-hidden="true">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              Tranche Deployment Active
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
              {plan.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Tranche steps */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">4-Tranche Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-0" aria-label="Tranche deployment schedule">
            {plan.entries.map((entry, index) => (
              <TrancheStep
                key={entry.tranche}
                entry={entry}
                isLast={index === plan.entries.length - 1}
              />
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Tranche step ──────────────────────────────────────────────────────────────

function TrancheStep({
  entry,
  isLast,
}: {
  entry: TrancheEntry
  isLast: boolean
}) {
  const isActive = entry.status === 'active'
  const isComplete = entry.status === 'complete'

  const dotClass = isActive
    ? 'bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-800'
    : isComplete
      ? 'bg-green-500'
      : 'bg-muted-foreground/30'

  const labelClass = isActive
    ? 'text-foreground font-semibold'
    : isComplete
      ? 'text-muted-foreground line-through'
      : 'text-muted-foreground'

  return (
    <li className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center w-4 shrink-0">
        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${dotClass}`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
      </div>

      {/* Content */}
      <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${labelClass}`}>{entry.label}</span>
          <StatusBadge status={entry.status} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-1 italic">
          Condition: {entry.condition}
        </p>
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: TrancheEntry['status'] }) {
  const config = {
    active: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    pending: 'bg-muted text-muted-foreground',
    complete: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  }

  const labels = {
    active: 'Active',
    pending: 'Pending',
    complete: 'Complete',
  }

  return (
    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${config[status]}`}>
      {labels[status]}
    </Badge>
  )
}
