'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventChip, EVENT_TYPE_LABELS, EVENT_TYPE_DOT } from './event-chip'
import { EventPopover } from './event-popover'
import { EventForm } from './event-form'
import type { CalendarEventWithRelations } from '@/lib/calendar/actions'

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface Props {
  events: CalendarEventWithRelations[]
}

export function CalendarView({ events }: Props) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [anchor, setAnchor] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithRelations | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEventWithRelations | null>(null)
  const [creatingDate, setCreatingDate] = useState<string | null>(null)

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventWithRelations[]> = {}
    for (const e of events) {
      if (!map[e.start_date]) map[e.start_date] = []
      map[e.start_date].push(e)
    }
    return map
  }, [events])

  const todayISO = toISODate(new Date())

  function goPrev() {
    const next = new Date(anchor)
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1)
    else next.setDate(next.getDate() - 7)
    setAnchor(next)
  }
  function goNext() {
    const next = new Date(anchor)
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1)
    else next.setDate(next.getDate() + 7)
    setAnchor(next)
  }
  function goToday() {
    setAnchor(new Date())
  }

  const monthCells = useMemo(() => {
    if (viewMode !== 'month') return []
    const year = anchor.getFullYear()
    const month = anchor.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [anchor, viewMode])

  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return []
    const start = new Date(anchor)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [anchor, viewMode])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold ml-2">
            {viewMode === 'month'
              ? `${MONTH_LABELS[anchor.getMonth()]} ${anchor.getFullYear()}`
              : `Semana de ${weekDays[0]?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              onClick={() => setViewMode('month')}
            >
              Mês
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              onClick={() => setViewMode('week')}
            >
              Semana
            </button>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setCreatingDate(todayISO)}>
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${EVENT_TYPE_DOT[type]}`} />
            {label}
          </div>
        ))}
      </div>

      {viewMode === 'month' ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((date, i) => {
              const iso = date ? toISODate(date) : null
              const dayEvents = iso ? eventsByDate[iso] ?? [] : []
              const isToday = iso === todayISO
              const visible = dayEvents.slice(0, 3)
              const overflow = dayEvents.length - visible.length

              return (
                <div
                  key={i}
                  className={`min-h-[100px] border-b border-r p-1.5 ${date ? 'cursor-pointer hover:bg-muted/30' : 'bg-muted/10'}`}
                  onClick={() => date && setCreatingDate(iso)}
                >
                  {date && (
                    <>
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${isToday ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {date.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {visible.map((e) => (
                          <EventChip key={e.id} event={e} onClick={() => setSelectedEvent(e)} />
                        ))}
                        {overflow > 0 && (
                          <p className="text-[10px] text-muted-foreground pl-1">+{overflow} mais</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {weekDays.map((date) => {
            const iso = toISODate(date)
            const dayEvents = eventsByDate[iso] ?? []
            const isToday = iso === todayISO

            return (
              <div key={iso} className={`rounded-lg border p-2 min-h-[160px] ${isToday ? 'border-primary/50 bg-primary/5' : ''}`}>
                <p className="text-xs font-semibold mb-2">
                  {WEEKDAY_LABELS[date.getDay()]} <span className="text-muted-foreground font-normal">{date.getDate()}</span>
                </p>
                <div className="space-y-1">
                  {dayEvents.map((e) => (
                    <EventChip key={e.id} event={e} onClick={() => setSelectedEvent(e)} />
                  ))}
                  {dayEvents.length === 0 && (
                    <button
                      onClick={() => setCreatingDate(iso)}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      + evento
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedEvent && !editingEvent && (
        <EventPopover
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => { setEditingEvent(selectedEvent); setSelectedEvent(null) }}
        />
      )}

      {editingEvent && (
        <EventForm open onClose={() => setEditingEvent(null)} event={editingEvent} />
      )}

      {creatingDate && (
        <EventForm open onClose={() => setCreatingDate(null)} defaultDate={creatingDate} />
      )}
    </div>
  )
}
