import { PageHeader } from '@/components/shared/page-header'
import { getEvents } from '@/lib/calendar/actions'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const events = await getEvents()

  return (
    <>
      <PageHeader
        title="Calendário"
        description="Visão temporal de vistorias e atividades"
      />
      <CalendarView events={events} />
    </>
  )
}
