'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'

export function PrintButton() {
  const params = useParams()
  const id = params?.id as string

  function handlePrint() {
    const printUrl = `/reports/${id}/print`
    const win = window.open(printUrl, '_blank')
    if (win) {
      win.onload = () => {
        setTimeout(() => win.print(), 800)
      }
    }
  }

  return (
    <Button onClick={handlePrint} variant="outline" size="sm">
      <Printer className="h-4 w-4 mr-1.5" />
      Exportar PDF
    </Button>
  )
}
