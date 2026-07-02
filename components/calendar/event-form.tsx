'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createEvent, updateEvent, type CalendarEventWithRelations } from '@/lib/calendar/actions'
import type { CalendarEventType } from '@/types'
import { EVENT_TYPE_LABELS } from './event-chip'

interface Props {
  open: boolean
  onClose: () => void
  event?: CalendarEventWithRelations
  defaultDate?: string
}

const MANUAL_TYPES: CalendarEventType[] = ['report_deadline', 'revisit']

export function EventForm({ open, onClose, event, defaultDate }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState<string>(event?.event_type ?? 'revisit')

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    const input = {
      title: formData.get('title') as string,
      event_type: eventType as CalendarEventType,
      start_date: formData.get('start_date') as string,
    }

    const result = event
      ? await updateEvent(event.id, input)
      : await createEvent(input)

    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar evento' : 'Novo evento'}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required defaultValue={event?.title} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANUAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Data *</Label>
              <Input id="start_date" name="start_date" type="date" required defaultValue={event?.start_date ?? defaultDate ?? ''} />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
