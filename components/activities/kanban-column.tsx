'use client'

import { useDroppable } from '@dnd-kit/core'
import type { ActivityWithRelations } from '@/lib/activities/actions'
import { ActivityCard } from './activity-card'
import type { ActivityStatus } from '@/types'

const COLUMN_CLASSES: Record<ActivityStatus, string> = {
  planned: 'bg-muted/40',
  started: 'bg-blue-50/60',
  done: 'bg-green-50/60',
}

interface Props {
  status: ActivityStatus
  title: string
  activities: ActivityWithRelations[]
  onCardClick: (activity: ActivityWithRelations) => void
}

export function KanbanColumn({ status, title, activities, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border p-3 min-h-[400px] transition-colors ${COLUMN_CLASSES[status]} ${isOver ? 'ring-2 ring-primary/40' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground rounded-full bg-background border px-2 py-0.5">
          {activities.length}
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onClick={() => onCardClick(activity)} />
        ))}
        {activities.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhuma atividade</p>
        )}
      </div>
    </div>
  )
}
