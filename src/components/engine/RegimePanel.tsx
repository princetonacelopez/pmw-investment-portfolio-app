'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEngineStore } from '@/store/engine-store'
import type { RegimeIndicators } from '@/types/engine'

const INDICATORS: Array<{
  key: keyof RegimeIndicators
  label: string
  positiveLabel: string
  negativeLabel: string
}> = [
  {
    key: 'inflationTrend',
    label: 'Inflation Trend',
    positiveLabel: 'Falling ↓',
    negativeLabel: 'Rising ↑',
  },
  {
    key: 'realYields',
    label: 'Real Yields',
    positiveLabel: 'Falling ↓',
    negativeLabel: 'Rising ↑',
  },
  {
    key: 'yieldCurve',
    label: 'Yield Curve',
    positiveLabel: 'Steepening',
    negativeLabel: 'Inverted',
  },
  {
    key: 'liquidityM2CB',
    label: 'Liquidity (M2/CB)',
    positiveLabel: 'Expanding',
    negativeLabel: 'Tightening',
  },
  {
    key: 'creditSpreads',
    label: 'Credit Spreads',
    positiveLabel: 'Tight',
    negativeLabel: 'Widening',
  },
]

export function RegimePanel() {
  const { regimeInputs, setRegimeIndicator } = useEngineStore()

  const rawScore = Object.values(regimeInputs).reduce(
    (sum, v) => sum + v,
    0,
  )
  const scoreLabel =
    rawScore >= 3 ? 'Risk ON' : rawScore >= 0 ? 'Neutral' : 'Risk OFF'
  const scoreBadgeVariant =
    rawScore >= 3
      ? 'bullish'
      : rawScore >= 0
        ? 'neutral'
        : 'bearish'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            Regime (Macro)
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums font-mono">
              {rawScore > 0 ? '+' : ''}{rawScore}/5
            </span>
            <SignalBadge variant={scoreBadgeVariant} label={scoreLabel} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {INDICATORS.map(({ key, label, positiveLabel, negativeLabel }) => {
          const value = regimeInputs[key]
          return (
            <fieldset key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 py-1">
              <legend className="sr-only">{label} signal</legend>
              <span className="text-sm text-foreground truncate">{label}</span>
              <ToggleButton
                active={value === 1}
                variant="bullish"
                onClick={() => setRegimeIndicator(key, 1)}
                aria-pressed={value === 1}
              >
                {positiveLabel}
              </ToggleButton>
              <ToggleButton
                active={value === -1}
                variant="bearish"
                onClick={() => setRegimeIndicator(key, -1)}
                aria-pressed={value === -1}
              >
                {negativeLabel}
              </ToggleButton>
            </fieldset>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SignalBadge({
  variant,
  label,
}: {
  variant: 'bullish' | 'neutral' | 'bearish'
  label: string
}) {
  const classes = {
    bullish:
      'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    neutral: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    bearish: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  }

  return (
    <Badge
      className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 ${classes[variant]}`}
    >
      {label}
    </Badge>
  )
}

function ToggleButton({
  active,
  variant,
  onClick,
  children,
  'aria-pressed': ariaPressed,
}: {
  active: boolean
  variant: 'bullish' | 'bearish'
  onClick: () => void
  children: React.ReactNode
  'aria-pressed': boolean
}) {
  const activeClasses = {
    bullish:
      'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700',
    bearish:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700',
  }

  return (
    <button
      type="button"
      role="radio"
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={[
        'text-xs px-2.5 py-1 rounded-md border font-medium transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active
          ? activeClasses[variant]
          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
