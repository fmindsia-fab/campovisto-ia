'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createReport } from '@/lib/reports/actions'

interface Props {
  inspectionId: string
  propertyName: string
  visitDate: string
  existingReportId?: string | null
}

export function GenerateReportButton({ inspectionId, propertyName, visitDate, existingReportId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (existingReportId) {
      router.push(`/reports/${existingReportId}`)
      return
    }
    setLoading(true)
    const title = `Relatório — ${propertyName} · ${new Date(visitDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
    const result = await createReport(inspectionId, title)
    setLoading(false)
    if (result.error) {
      alert(`Erro ao gerar relatório: ${result.error}`)
      return
    }
    router.push(`/reports/${result.data!.id}`)
  }

  return (
    <Button size="sm" onClick={handleGenerate} disabled={loading}>
      <FileText className="h-4 w-4 mr-1.5" />
      {loading ? 'Gerando...' : existingReportId ? 'Ver relatório' : 'Gerar relatório'}
    </Button>
  )
}
