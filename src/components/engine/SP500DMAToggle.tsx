'use client'

import { useEngineStore } from '@/store/engine-store'

export function SP500DMAToggle() {
  const { sp500Above200DMA, setSp500Above200DMA } = useEngineStore()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">S&P 500 vs 200DMA</span>
      <button
        type="button"
        role="switch"
        aria-checked={sp500Above200DMA}
        aria-label="Toggle whether S&P 500 is above or below its 200-day moving average"
        onClick={() => setSp500Above200DMA(!sp500Above200DMA)}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          sp500Above200DMA
            ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
            : 'bg-red-400 border-red-400 dark:bg-red-600 dark:border-red-600',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            sp500Above200DMA ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
      <span
        className={[
          'text-xs font-medium',
          sp500Above200DMA
            ? 'text-green-700 dark:text-green-400'
            : 'text-red-600 dark:text-red-400',
        ].join(' ')}
      >
        {sp500Above200DMA ? '↑ Above (no overlay)' : '↓ Below (−1 overlay)'}
      </span>
    </div>
  )
}
