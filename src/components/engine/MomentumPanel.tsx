'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEngineStore } from '@/store/engine-store'
import type { AssetMomentumInput, MomentumAsset } from '@/types/engine'

const ASSET_LABELS: Record<MomentumAsset, string> = {
  SP500: 'S&P 500',
  NASDAQ: 'NASDAQ',
  SOXX: 'SOXX (Semi)',
}

export function MomentumPanel() {
  const { momentumInputs, setMomentumInput } = useEngineStore()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">
          Momentum (Trend)
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Weights: 6M ×0.4 · 12M ×0.4 · 200DMA ×0.2
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {momentumInputs.map((asset, index) => (
          <AssetRow
            key={asset.asset}
            asset={asset}
            index={index}
            onChange={setMomentumInput}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function AssetRow({
  asset,
  index,
  onChange,
}: {
  asset: AssetMomentumInput
  index: number
  onChange: (
    index: number,
    field: keyof AssetMomentumInput,
    value: unknown,
  ) => void
}) {
  const label = ASSET_LABELS[asset.asset]

  return (
    <div className="space-y-2" role="group" aria-label={`${label} momentum inputs`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge
          className={[
            'text-xs font-medium px-2 py-0.5 rounded-full border-0',
            asset.above200DMA
              ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
          ].join(' ')}
        >
          {asset.above200DMA ? '↑ Above 200DMA' : '↓ Below 200DMA'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* 6M Return */}
        <div className="space-y-1">
          <label
            htmlFor={`${asset.asset}-6m`}
            className="text-xs text-muted-foreground"
          >
            6M Return (%)
          </label>
          <input
            id={`${asset.asset}-6m`}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={asset.return6M * 100}
            onChange={(e) =>
              onChange(index, 'return6M', parseFloat(e.target.value) / 100 || 0)
            }
            className={[
              'w-full text-sm px-2 py-1.5 rounded-md border bg-background',
              'focus:outline-2 focus:outline-offset-1 focus:outline-ring',
              'tabular-nums font-mono',
            ].join(' ')}
            aria-label={`${label} 6-month return percentage`}
          />
        </div>

        {/* 12M Return */}
        <div className="space-y-1">
          <label
            htmlFor={`${asset.asset}-12m`}
            className="text-xs text-muted-foreground"
          >
            12M Return (%)
          </label>
          <input
            id={`${asset.asset}-12m`}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={asset.return12M * 100}
            onChange={(e) =>
              onChange(index, 'return12M', parseFloat(e.target.value) / 100 || 0)
            }
            className={[
              'w-full text-sm px-2 py-1.5 rounded-md border bg-background',
              'focus:outline-2 focus:outline-offset-1 focus:outline-ring',
              'tabular-nums font-mono',
            ].join(' ')}
            aria-label={`${label} 12-month return percentage`}
          />
        </div>

        {/* 200DMA toggle */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground block">200 DMA</span>
          <button
            type="button"
            role="switch"
            aria-checked={asset.above200DMA}
            aria-label={`${label} above 200-day moving average`}
            onClick={() => onChange(index, 'above200DMA', !asset.above200DMA)}
            className={[
              'w-full text-xs px-2 py-1.5 rounded-md border font-medium transition-colors cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              asset.above200DMA
                ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700'
                : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700',
            ].join(' ')}
          >
            {asset.above200DMA ? 'Above' : 'Below'}
          </button>
        </div>
      </div>
    </div>
  )
}
