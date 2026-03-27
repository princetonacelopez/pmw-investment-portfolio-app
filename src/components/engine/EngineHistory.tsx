import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import type { EngineSnapshot, DecisionSignal } from '@/types/engine'

// ── Signal colour helper (shared with DecisionOutput) ────────────────────────

function signalColor(signal: DecisionSignal): string {
  if (signal.includes('Risk ON') || signal === 'Mild Risk ON' || signal === 'Aggressive Risk ON') {
    return 'text-green-600 dark:text-green-400'
  }
  if (signal === 'Neutral') return 'text-blue-600 dark:text-blue-400'
  if (signal === 'Caution') return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function scoreBg(score: number): string {
  if (score > 0) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
  if (score < 0) return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
}

// ── Score sparkline ───────────────────────────────────────────────────────────

function ScoreSparkline({ snapshots }: { snapshots: EngineSnapshot[] }) {
  if (snapshots.length < 2) return null

  const scores = [...snapshots].reverse().map((s) => s.adjusted_score)
  const min = -3
  const max = 3
  const range = max - min
  const w = 280
  const h = 48
  const pad = 4

  const points = scores.map((score, i) => {
    const x = pad + (i / (scores.length - 1)) * (w - pad * 2)
    const y = h - pad - ((score - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })

  return (
    <div className="mt-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Score Trend (last {scores.length} runs)
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        aria-label="Score trend sparkline"
        role="img"
        className="overflow-visible"
      >
        {/* Zero line */}
        <line
          x1={pad}
          y1={h - pad - ((0 - min) / range) * (h - pad * 2)}
          x2={w - pad}
          y2={h - pad - ((0 - min) / range) * (h - pad * 2)}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1}
          strokeDasharray="3,3"
          className="text-foreground"
        />
        {/* Score line */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-primary"
          style={{ color: 'oklch(0.55 0.2 142)' }}
        />
        {/* Dots */}
        {points.map((pt, i) => {
          const [x, y] = pt.split(',').map(Number)
          const score = scores[i] ?? 0
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.5}
              fill={score > 0 ? 'oklch(0.55 0.2 142)' : score < 0 ? 'oklch(0.55 0.2 27)' : 'oklch(0.55 0.2 260)'}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function EngineHistory() {
  const [snapshots, setSnapshots] = useState<EngineSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchSnapshots() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('engine_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (err) {
        setError(err.message)
      } else {
        setSnapshots((data ?? []) as EngineSnapshot[])
      }
      setLoading(false)
    }

    void fetchSnapshots()
  }, [])

  return (
    <div className="space-y-3">
      {snapshots.length >= 2 && (
        <Card>
          <CardContent className="pt-4">
            <ScoreSparkline snapshots={snapshots} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Engine Run History</CardTitle>
            {!loading && !error && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {snapshots.length} record{snapshots.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading && <HistorySkeleton />}
          {error && <HistoryError message={error} />}
          {!loading && !error && snapshots.length === 0 && <HistoryEmpty />}
          {!loading && !error && snapshots.length > 0 && (
            <div className="space-y-0">
              {snapshots.map((snap, index) => (
                <SnapshotRow
                  key={snap.id}
                  snapshot={snap}
                  isLast={index === snapshots.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────

function SnapshotRow({
  snapshot,
  isLast,
}: {
  snapshot: EngineSnapshot
  isLast: boolean
}) {
  const score = snapshot.adjusted_score

  return (
    <>
      <div className="flex items-center gap-3 py-2.5">
        {/* Score badge */}
        <Badge className={`text-xs font-bold tabular-nums shrink-0 border-0 px-2 ${scoreBg(score)}`}>
          {score > 0 ? '+' : ''}{score}
        </Badge>

        {/* Signal */}
        <span className={`text-sm font-medium flex-1 min-w-0 truncate ${signalColor(snapshot.signal)}`}>
          {snapshot.signal}
        </span>

        {/* Pillar indicators */}
        <div className="flex gap-1 shrink-0" aria-label="R M F signals">
          <PillarDot signal={snapshot.regime_signal} label="R" />
          <PillarDot signal={snapshot.momentum_signal} label="M" />
          <PillarDot signal={snapshot.fundamentals_signal} label="F" />
        </div>

        {/* Date */}
        <span className="text-xs text-muted-foreground tabular-nums shrink-0 hidden sm:block">
          {new Date(snapshot.created_at).toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        {/* Tranche indicator */}
        {snapshot.tranche_active && (
          <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0" title="Tranche active">
            ⚡
          </span>
        )}
      </div>
      {!isLast && <Separator />}
    </>
  )
}

function PillarDot({ signal, label }: { signal: number; label: string }) {
  const color =
    signal === 1
      ? 'bg-green-500'
      : signal === -1
        ? 'bg-red-500'
        : 'bg-blue-400'

  return (
    <span
      title={`${label}: ${signal > 0 ? '+1' : signal < 0 ? '-1' : '0'}`}
      className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white ${color}`}
      aria-label={`${label} signal: ${signal}`}
    >
      {label}
    </span>
  )
}

// ── States ────────────────────────────────────────────────────────────────────

function HistorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 items-center py-2">
          <div className="w-10 h-5 bg-muted rounded-full" />
          <div className="flex-1 h-4 bg-muted rounded" />
          <div className="w-20 h-4 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

function HistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
      <p className="text-sm text-muted-foreground">No engine runs recorded yet.</p>
      <p className="text-xs text-muted-foreground/60">
        Run the engine to start building your audit trail.
      </p>
    </div>
  )
}

function HistoryError({ message }: { message: string }) {
  return (
    <div className="flex gap-2 items-start py-4">
      <span className="text-destructive text-sm" aria-hidden="true">⚠</span>
      <div>
        <p className="text-sm text-destructive">Failed to load history</p>
        <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
      </div>
    </div>
  )
}
