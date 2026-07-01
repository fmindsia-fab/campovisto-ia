'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'

export function PrintButton() {
  const params = useParams()
  const id = params?.id as string

  function handlePrint() {
    window.open(`/reports/${id}/print`, '_blank')
  }

  return (
    <Button onClick={handlePrint} variant="outline" size="sm">
      <Printer className="h-4 w-4 mr-1.5" />
      Exportar PDF
    </Button>
  )
}
