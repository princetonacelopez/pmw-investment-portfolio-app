import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useEngineStore } from '@/store/engine-store'
import { runEngine } from '@/lib/actions/run-engine'

export function RunEngineButton() {
  const [isPending, setIsPending] = useState(false)

  const {
    regimeInputs,
    momentumInputs,
    fundamentalsInputs,
    sp500Above200DMA,
    setEngineResult,
    setIsCalculating,
    setError,
    resetInputs,
  } = useEngineStore()

  async function handleRun() {
    setIsPending(true)
    setIsCalculating(true)
    setError(null)

    const result = await runEngine({
      regime: regimeInputs,
      momentum: momentumInputs,
      fundamentals: fundamentalsInputs,
      sp500Above200DMA,
    })

    setIsPending(false)
    setIsCalculating(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      setEngineResult(result.data)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleRun}
        disabled={isPending}
        size="lg"
        className="min-w-36"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
              aria-hidden="true"
            />
            Running…
          </>
        ) : (
          'Run Engine'
        )}
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={resetInputs}
        disabled={isPending}
      >
        Reset
      </Button>
    </div>
  )
}
