'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useEngineStore } from '@/store/engine-store'
import type { EngineResult, DecisionSignal } from '@/types/engine'

const SIGNAL_CONFIG: Record<
  DecisionSignal,
  { variant: 'bullish' | 'neutral' | 'bearish'; color: string }
> = {
  'Aggressive Risk ON': { variant: 'bullish', color: 'text-green-700 dark:text-green-400' },
  'Risk ON': { variant: 'bullish', color: 'text-green-700 dark:text-green-400' },
  'Mild Risk ON': { variant: 'bullish', color: 'text-green-600 dark:text-green-500' },
  Neutral: { variant: 'neutral', color: 'text-blue-700 dark:text-blue-400' },
  Caution: { variant: 'bearish', color: 'text-amber-700 dark:text-amber-400' },
  Defensive: { variant: 'bearish', color: 'text-red-600 dark:text-red-400' },
  'Risk OFF': { variant: 'bearish', color: 'text-red-700 dark:text-red-400' },
}

export function DecisionOutput() {
  const { engineResult, isCalculating, lastError } = useEngineStore()

  if (isCalculating) {
    return <DecisionSkeleton />
  }

  if (lastError) {
    return <DecisionError message={lastError} />
  }

  if (!engineResult) {
    return <DecisionEmpty />
  }

  return <DecisionResult result={engineResult} />
}

// ── States ────────────────────────────────────────────────────────────────────

function DecisionEmpty() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="text-4xl" aria-hidden="true">📊</div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Configure the inputs above and click{' '}
          <strong className="text-foreground">Run Engine</strong> to generate
          the portfolio decision.
        </p>
      </CardContent>
    </Card>
  )
}

function DecisionSkeleton() {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="space-y-3 animate-pulse">
          <div className="h-8 bg-muted rounded-md w-2/3" />
          <div className="h-4 bg-muted rounded-md w-full" />
          <div className="h-4 bg-muted rounded-md w-4/5" />
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-muted rounded-md" />
            <div className="h-20 bg-muted rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DecisionError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="py-6">
        <div className="flex gap-3 items-start">
          <span className="text-destructive text-lg" aria-hidden="true">⚠</span>
          <div>
            <p className="text-sm font-medium text-destructive">Engine Error</p>
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DecisionResult({ result }: { result: EngineResult }) {
  const { signal, portfolioAction, allocation, adjustedScore, baseScore,
    dmaOverlayApplied, tranche, clientText, calculatedAt,
    regime, momentum, fundamentals } = result

  const cfg = SIGNAL_CONFIG[signal]

  return (
    <div className="space-y-3">
      {/* Main signal card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Decision Signal
              </p>
              <h2 className={`text-2xl font-bold tracking-tight ${cfg.color}`}>
                {signal}
              </h2>
            </div>
            <ScoreBadge score={adjustedScore} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Portfolio Action
            </p>
            <p className="text-sm font-medium">{portfolioAction}</p>
          </div>

          <Separator />

          {/* Allocation bar */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Allocation
            </p>
            <AllocationBar growth={allocation.growth} defensive={allocation.defensive} />
          </div>

          <Separator />

          {/* Pillar breakdown */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Pillar Signals
            </p>
            <div className="grid grid-cols-3 gap-2">
              <PillarChip
                label="Regime"
                signal={regime.signal}
                sublabel={regime.label}
                score={`${regime.rawScore > 0 ? '+' : ''}${regime.rawScore}`}
              />
              <PillarChip
                label="Momentum"
                signal={momentum.signal}
                sublabel={momentum.label}
                score={momentum.weightedScore.toFixed(2)}
              />
              <PillarChip
                label="Fundamentals"
                signal={fundamentals.signal}
                sublabel={fundamentals.label}
                score={fundamentals.averageScore.toFixed(2)}
              />
            </div>
          </div>

          {/* Overlay + tranche alerts */}
          {(dmaOverlayApplied || tranche.trancheActive) && (
            <>
              <Separator />
              <div className="space-y-2">
                {dmaOverlayApplied && (
                  <AlertChip variant="warning">
                    200DMA Overlay applied — base score {baseScore > 0 ? '+' : ''}{baseScore} → adjusted {adjustedScore > 0 ? '+' : ''}{adjustedScore}
                  </AlertChip>
                )}
                {tranche.trancheActive && (
                  <AlertChip variant="info">
                    Tranche deployment active — {tranche.schedule.join(' · ')}
                  </AlertChip>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Client text */}
          <blockquote className="border-l-2 border-muted-foreground/30 pl-3">
            <p className="text-sm text-muted-foreground italic">{clientText}</p>
          </blockquote>

          {/* Audit footer */}
          <p className="text-xs text-muted-foreground/60 tabular-nums font-mono">
            Calculated {new Date(calculatedAt).toLocaleString('en-AU', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Display sub-components ────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const bg =
    score > 0
      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
      : score < 0
        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'

  return (
    <Badge className={`text-lg font-bold px-3 py-1 rounded-full border-0 tabular-nums ${bg}`}>
      {score > 0 ? '+' : ''}{score}
    </Badge>
  )
}

function AllocationBar({
  growth,
  defensive,
}: {
  growth: number
  defensive: number
}) {
  return (
    <div className="space-y-2">
      <div
        className="w-full h-4 rounded-full overflow-hidden flex"
        role="img"
        aria-label={`${growth}% growth, ${defensive}% defensive`}
      >
        <div
          className="h-full bg-green-500 dark:bg-green-600 transition-all"
          style={{ width: `${growth}%` }}
        />
        <div
          className="h-full bg-blue-300 dark:bg-blue-700 transition-all flex-1"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />
          Growth {growth}%
        </span>
        <span>
          Defensive {defensive}%
          <span className="inline-block w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-700 ml-1.5" />
        </span>
      </div>
    </div>
  )
}

function PillarChip({
  label,
  signal,
  sublabel,
  score,
}: {
  label: string
  signal: number
  sublabel: string
  score: string
}) {
  const classes =
    signal === 1
      ? 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800'
      : signal === -1
        ? 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800'
        : 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'

  const scoreColor =
    signal === 1
      ? 'text-green-700 dark:text-green-400'
      : signal === -1
        ? 'text-red-700 dark:text-red-400'
        : 'text-blue-700 dark:text-blue-400'

  const signalIcon = signal === 1 ? '▲' : signal === -1 ? '▼' : '─'

  return (
    <div className={`rounded-lg border p-2 text-center ${classes}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${scoreColor}`}>
        {signalIcon} {sublabel}
      </p>
      <p className="text-xs font-mono text-muted-foreground tabular-nums">{score}</p>
    </div>
  )
}

function AlertChip({
  variant,
  children,
}: {
  variant: 'warning' | 'info'
  children: React.ReactNode
}) {
  const classes = {
    warning:
      'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300',
    info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300',
  }

  return (
    <div className={`text-xs px-3 py-2 rounded-md border ${classes[variant]}`}>
      {children}
    </div>
  )
}
