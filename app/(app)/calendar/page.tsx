import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendário"
        description="Visão temporal de vistorias e atividades"
      />
      <EmptyState
        icon={Calendar}
        title="Calendário sem eventos"
        description="Vistorias e atividades agendadas aparecerão aqui."
      />
    </>
  )
}
