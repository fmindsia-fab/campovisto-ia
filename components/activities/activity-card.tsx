'use client'

import { useDraggable } from '@dnd-kit/core'
import { CalendarDays, CheckCircle2, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { todayISODate } from '@/lib/utils'
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

function getDueInfo(dueDate: string) {
  const due = new Date(dueDate + 'T00:00:00')
  const formatted = due.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  const today = new Date(todayISODate() + 'T00:00:00')
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diffDays < 0) {
    return {
      label: `Atrasado há ${Math.abs(diffDays)} dia${Math.abs(diffDays) > 1 ? 's' : ''}`,
      className: 'bg-red-50 text-red-700 border-red-200',
    }
  }
  if (diffDays === 0) {
    return { label: 'Vence hoje', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  if (diffDays <= 3) {
    return { label: `Vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`, className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  return { label: formatted, className: 'bg-muted text-muted-foreground border-border' }
}

function getDeliveryInfo(completedAt: string) {
  const label = new Date(completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return { label: `Entregue em ${label}`, className: 'bg-green-50 text-green-700 border-green-200' }
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
  const isDone = activity.status === 'done'
  const deliveryInfo = isDone && activity.completed_at ? getDeliveryInfo(activity.completed_at) : null
  const dueInfo = !isDone && activity.due_date ? getDueInfo(activity.due_date) : null

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

      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="text-[10px]">{PRIORITY_LABELS[activity.priority]}</Badge>
        {deliveryInfo && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${deliveryInfo.className}`}>
            <CheckCircle2 className="h-3 w-3" />
            {deliveryInfo.label}
          </span>
        )}
        {dueInfo && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${dueInfo.className}`}>
            <CalendarDays className="h-3 w-3" />
            {dueInfo.label}
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
