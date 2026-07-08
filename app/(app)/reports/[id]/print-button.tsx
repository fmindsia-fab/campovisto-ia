'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

export function PrintButton() {
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${id}/pdf`, { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Falha ao gerar PDF')
        return
      }

      window.open(json.url, '_blank')
    } catch {
      toast.error('Falha ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm" disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4 mr-1.5" />
      )}
      {loading ? 'Gerando PDF...' : 'Exportar PDF'}
    </Button>
  )
}
