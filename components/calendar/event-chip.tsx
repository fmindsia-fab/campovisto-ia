'use client'

import { todayISODate } from '@/lib/utils'
import type { CalendarEventWithRelations } from '@/lib/calendar/actions'

export const EVENT_TYPE_LABELS: Record<string, string> = {
  visit: 'Visita',
  report_deadline: 'Prazo de Relatório',
  activity: 'Atividade',
  revisit: 'Revisita',
}

export const EVENT_TYPE_CLASSES: Record<string, string> = {
  visit: 'bg-green-100 text-green-700 hover:bg-green-200',
  report_deadline: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  activity: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  revisit: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
}

export const EVENT_TYPE_DOT: Record<string, string> = {
  visit: 'bg-green-500',
  report_deadline: 'bg-purple-500',
  activity: 'bg-blue-500',
  revisit: 'bg-orange-500',
}

interface Props {
  event: CalendarEventWithRelations
  onClick: () => void
}

export function EventChip({ event, onClick }: Props) {
  const isOverdue = event.event_type !== 'visit' && event.start_date < todayISODate()

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium transition-colors ${EVENT_TYPE_CLASSES[event.event_type] ?? 'bg-muted'} ${isOverdue ? 'ring-1 ring-destructive/60' : ''}`}
      title={event.title}
    >
      {event.title}
    </button>
  )
}
