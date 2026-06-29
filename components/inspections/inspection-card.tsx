'use client'

import { useRouter } from 'next/navigation'
import { CalendarDays, MapPin, ClipboardList, Pencil, Trash2, ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteInspection } from '@/lib/inspections/actions'
import type { Inspection } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  in_progress: 'Em andamento',
  review_pending: 'Revisão pendente',
  completed: 'Concluída',
}

const STATUS_VARIANTS: Record<string, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  draft: 'secondary',
  in_progress: 'outline',
  review_pending: 'default',
  completed: 'secondary',
}

interface InspectionCardProps {
  inspection: Inspection & {
    properties?: { id: string; name: string; clients?: { id: string; name: string } }
    image_count?: number
  }
  onEdit: () => void
  onDeleted?: () => void
}

export function InspectionCard({ inspection, onEdit, onDeleted }: InspectionCardProps) {
  const router = useRouter()

  const formattedDate = new Date(inspection.visit_date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Excluir esta vistoria? As imagens também serão removidas.')) return
    const result = await deleteInspection(inspection.id)
    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`)
    } else {
      if (onDeleted) { onDeleted() } else { router.refresh() }
    }
  }

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/inspections/${inspection.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="truncate font-semibold">
                  {inspection.properties?.name ?? 'Propriedade'}
                </p>
                <Badge variant={STATUS_VARIANTS[inspection.status] ?? 'secondary'} className="text-xs">
                  {STATUS_LABELS[inspection.status] ?? inspection.status}
                </Badge>
              </div>
              {inspection.properties?.clients?.name && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {inspection.properties.clients.name}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />{formattedDate}
                </span>
                {inspection.image_count !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />{inspection.image_count} imagens
                  </span>
                )}
                {inspection.objective && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{inspection.objective}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
