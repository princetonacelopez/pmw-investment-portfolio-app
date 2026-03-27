import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { generateClientOutput } from '@/lib/engine/client-output'
import { useEngineStore } from '@/store/engine-store'

export function ClientOutput() {
  const { engineResult } = useEngineStore()
  const [copied, setCopied] = useState(false)

  if (!engineResult) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <div className="text-3xl" aria-hidden="true">✉️</div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Run the engine to generate adviser-ready client communication.
          </p>
        </CardContent>
      </Card>
    )
  }

  const output = generateClientOutput(engineResult)

  const fullText = [
    output.headline,
    '',
    output.body,
    '',
    'Key Actions:',
    ...output.bulletPoints.map((b, i) => `${i + 1}. ${b}`),
    '',
    output.disclaimer,
  ].join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-sm">Client Communication</CardTitle>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy communication to clipboard"
              className="text-xs px-2.5 py-1 rounded-md border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Headline */}
          <div className="rounded-lg bg-muted/50 px-4 py-3 border-l-2 border-foreground/20">
            <p className="text-sm font-semibold leading-snug">{output.headline}</p>
          </div>

          {/* Body */}
          <p className="text-sm text-muted-foreground leading-relaxed">{output.body}</p>

          <Separator />

          {/* Bullet points */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Key Actions
            </p>
            <ol className="space-y-2" aria-label="Key actions for client">
              {output.bulletPoints.map((point, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-foreground/80 leading-snug">{point}</span>
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          {/* Disclaimer */}
          <div className="rounded-md bg-muted/30 px-3 py-2">
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              <span className="font-medium text-muted-foreground">Disclaimer: </span>
              {output.disclaimer}
            </p>
          </div>

          {/* Audit footer */}
          <p className="text-xs text-muted-foreground/50 font-mono tabular-nums">
            Generated {new Date(output.generatedAt).toLocaleString('en-AU', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
