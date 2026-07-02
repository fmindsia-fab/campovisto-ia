'use client'

import { useDraggable } from '@dnd-kit/core'
import { CalendarDays, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ActivityWithRelations } from '@/lib/activities/actions'

const PRIORITY_CLASSES: Record<string, string> = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-amber-400',
  low: 'border-l-4 border-l-green-500',
}

const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' }

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planejada',
  started: 'Iniciada',
  done: 'Finalizada',
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-600 border-slate-200',
  started: 'bg-blue-100 text-blue-700 border-blue-200',
  done: 'bg-green-100 text-green-700 border-green-200',
}

interface Props {
  activity: ActivityWithRelations
  onClick: () => void
}

export function ActivityCard({ activity, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
  })

  const property = activity.inspections?.properties
  const isOverdue = activity.due_date && activity.status !== 'done' && new Date(activity.due_date) < new Date(new Date().toDateString())

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`relative rounded-lg border bg-card p-3 pt-2 cursor-pointer hover:border-primary/50 transition-colors ${PRIORITY_CLASSES[activity.priority] ?? ''} ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-end mb-1">
        <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${STATUS_BADGE_CLASSES[activity.status] ?? ''}`}>
          {STATUS_LABELS[activity.status] ?? activity.status}
        </span>
      </div>

      <p className="text-sm font-medium leading-tight mb-1.5 line-clamp-2">{activity.title}</p>

      {property && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{property.name}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px]">{PRIORITY_LABELS[activity.priority]}</Badge>
        {activity.due_date && (
          <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            <CalendarDays className="h-3 w-3" />
            {new Date(activity.due_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>

      {activity.assigned_profile?.full_name && (
        <p className="mt-1.5 text-[10px] text-muted-foreground truncate">
          {activity.assigned_profile.full_name}
        </p>
      )}
    </div>
  )
}
