'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEngineStore } from '@/store/engine-store'
import type { FundamentalsFactors, TernaryScore } from '@/types/engine'

const FACTORS: Array<{
  key: keyof FundamentalsFactors
  label: string
  options: Array<{ value: TernaryScore; label: string; variant: 'bullish' | 'neutral' | 'bearish' }>
}> = [
  {
    key: 'valuationVsHistory',
    label: 'Valuation vs History',
    options: [
      { value: 1, label: 'Cheap', variant: 'bullish' },
      { value: 0.5, label: 'Fair', variant: 'neutral' },
      { value: 0, label: 'Expensive', variant: 'bearish' },
    ],
  },
  {
    key: 'earningsTrend',
    label: 'Earnings Trend',
    options: [
      { value: 1, label: 'Rising', variant: 'bullish' },
      { value: 0.5, label: 'Flat', variant: 'neutral' },
      { value: 0, label: 'Falling', variant: 'bearish' },
    ],
  },
  {
    key: 'riskLevel',
    label: 'Risk Level',
    options: [
      { value: 1, label: 'Low', variant: 'bullish' },
      { value: 0.5, label: 'Medium', variant: 'neutral' },
      { value: 0, label: 'High', variant: 'bearish' },
    ],
  },
]

export function FundamentalsPanel() {
  const { fundamentalsInputs, setFundamentalsFactor } = useEngineStore()

  const avg =
    (fundamentalsInputs.valuationVsHistory +
      fundamentalsInputs.earningsTrend +
      fundamentalsInputs.riskLevel) /
    3

  const scoreLabel = avg > 0.7 ? 'Strong' : avg >= 0.4 ? 'Neutral' : 'Weak'
  const scoreBadgeVariant =
    avg > 0.7 ? 'bullish' : avg >= 0.4 ? 'neutral' : 'bearish'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            Fundamentals
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums font-mono">
              avg {avg.toFixed(2)}
            </span>
            <FundamentalsBadge variant={scoreBadgeVariant} label={scoreLabel} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {FACTORS.map(({ key, label, options }) => {
          const current = fundamentalsInputs[key]
          return (
            <fieldset key={key} className="space-y-1">
              <legend className="text-sm text-foreground">{label}</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {options.map(({ value, label: optLabel, variant }) => (
                  <TernaryButton
                    key={String(value)}
                    active={current === value}
                    variant={variant}
                    onClick={() => setFundamentalsFactor(key, value)}
                    aria-pressed={current === value}
                  >
                    {optLabel}
                  </TernaryButton>
                ))}
              </div>
            </fieldset>
          )
        })}
      </CardContent>
    </Card>
  )
}

function FundamentalsBadge({
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

function TernaryButton({
  active,
  variant,
  onClick,
  children,
  'aria-pressed': ariaPressed,
}: {
  active: boolean
  variant: 'bullish' | 'neutral' | 'bearish'
  onClick: () => void
  children: React.ReactNode
  'aria-pressed': boolean
}) {
  const activeClasses = {
    bullish:
      'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700',
    neutral:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
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
        'text-xs px-2 py-1.5 rounded-md border font-medium transition-colors cursor-pointer text-center',
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
