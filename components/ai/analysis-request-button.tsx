'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  imageId: string
  inspectionId: string
  imageUrl: string
  imageType: string | null
  fieldObservations: string | null
  onSuccess: () => void
}

export function AnalysisRequestButton({
  imageId,
  inspectionId,
  imageUrl,
  imageType,
  fieldObservations,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRequest() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, inspectionId, imageUrl, imageType, fieldObservations }),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Erro ao solicitar análise')
        return
      }
      onSuccess()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleRequest} disabled={loading} className="w-full gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analisando imagem...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Solicitar análise por IA
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
