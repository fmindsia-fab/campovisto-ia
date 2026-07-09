'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { CheckSquare } from 'lucide-react'
import { KanbanColumn } from './kanban-column'
import { ActivityForm } from './activity-form'
import { ActivityDetail } from './activity-detail'
import { updateActivityStatus, type ActivityWithRelations } from '@/lib/activities/actions'
import { addDaysISODate, todayISODate } from '@/lib/utils'
import type { ActivityStatus } from '@/types'

const COLUMNS: { status: ActivityStatus; title: string }[] = [
  { status: 'planned', title: 'Planejada' },
  { status: 'started', title: 'Iniciada' },
  { status: 'done', title: 'Finalizada' },
]

interface Props {
  initialActivities: ActivityWithRelations[]
  profiles: { id: string; full_name: string | null }[]
  properties: { id: string; name: string }[]
  inspections: { id: string; label: string }[]
}

export function ActivitiesBoard({ initialActivities, profiles, properties, inspections }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activities, setActivities] = useState(initialActivities)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ActivityWithRelations | null>(null)
  const [viewing, setViewing] = useState<ActivityWithRelations | null>(null)

  const [propertyFilter, setPropertyFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  useEffect(() => setActivities(initialActivities), [initialActivities])

  // deep-link vindo da busca global (?open=id) — abre o detalhe direto
  useEffect(() => {
    const openId = searchParams.get('open')
    if (!openId) return
    const found = initialActivities.find((a) => a.id === openId)
    if (found) setViewing(found)
  }, [searchParams, initialActivities])

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (propertyFilter !== 'all' && a.inspections?.properties?.id !== propertyFilter) return false
      if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false
      if (assignedFilter !== 'all' && a.assigned_to !== assignedFilter) return false
      if (periodFilter === 'overdue') {
        if (!a.due_date || a.status === 'done' || a.due_date >= todayISODate()) return false
      }
      if (periodFilter === 'week') {
        if (!a.due_date) return false
        if (a.due_date < todayISODate() || a.due_date > addDaysISODate(7)) return false
      }
      if (periodFilter === 'no_date' && a.due_date) return false
      return true
    })
  }, [activities, propertyFilter, priorityFilter, assignedFilter, periodFilter])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as ActivityStatus
    const activityId = active.id as string
    const current = activities.find((a) => a.id === activityId)
    if (!current || current.status === newStatus) return

    setActivities((prev) => prev.map((a) => (a.id === activityId
      ? { ...a, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }
      : a
    )))
    const result = await updateActivityStatus(activityId, newStatus)
    if (result.error) {
      alert(`Erro ao mover atividade: ${result.error}`)
      setActivities(initialActivities)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Propriedade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas propriedades</SelectItem>
              {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda prioridade</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo responsável</SelectItem>
              {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name ?? 'Sem nome'}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="overdue">Atrasadas</SelectItem>
              <SelectItem value="week">Próximos 7 dias</SelectItem>
              <SelectItem value="no_date">Sem prazo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nova atividade
        </Button>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Nenhuma atividade registrada"
          description="As atividades são geradas a partir das recomendações dos relatórios de vistoria, ou criadas manualmente."
          action={<Button onClick={() => setCreating(true)}>Criar atividade</Button>}
        />
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                activities={filtered.filter((a) => a.status === col.status)}
                onCardClick={setViewing}
              />
            ))}
          </div>
        </DndContext>
      )}

      {creating && (
        <ActivityForm open={creating} onClose={() => setCreating(false)} profiles={profiles} inspections={inspections} />
      )}

      {editing && (
        <ActivityForm
          open
          onClose={() => setEditing(null)}
          activity={editing}
          profiles={profiles}
          inspections={inspections}
        />
      )}

      {viewing && !editing && (
        <ActivityDetail
          activity={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null) }}
        />
      )}
    </div>
  )
}
