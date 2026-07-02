'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteEvent, type CalendarEventWithRelations } from '@/lib/calendar/actions'
import { EVENT_TYPE_LABELS } from './event-chip'

interface Props {
  event: CalendarEventWithRelations
  onClose: () => void
  onEdit: () => void
}

export function EventPopover({ event, onClose, onEdit }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const isManual = !event.inspection_id && !event.activity_id && !event.report_id
  const linkHref = event.inspection_id
    ? `/inspections/${event.inspection_id}`
    : event.activity_id
    ? `/activities`
    : event.report_id
    ? `/reports/${event.report_id}`
    : null

  const linkLabel = event.inspection_id
    ? event.inspections?.properties?.name ?? 'Ver vistoria'
    : event.activity_id
    ? event.activities?.title ?? 'Ver atividade'
    : event.report_id
    ? event.reports?.title ?? 'Ver relatório'
    : null

  async function handleDelete() {
    if (!confirm('Excluir este evento?')) return
    setDeleting(true)
    const result = await deleteEvent(event.id)
    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`)
      setDeleting(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}</Badge>
            <Badge variant="outline">
              {new Date(event.start_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Badge>
          </div>

          {linkHref && linkLabel && (
            <Link href={linkHref} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />
              {linkLabel}
            </Link>
          )}

          {isManual && (
            <div className="flex gap-2 border-t pt-3">
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </Button>
            </div>
          )}

          {!isManual && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              Este evento é gerado automaticamente e não pode ser editado diretamente aqui.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
