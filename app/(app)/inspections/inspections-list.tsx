'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useTransition } from 'react'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InspectionCard } from '@/components/inspections/inspection-card'
import { InspectionForm } from '@/components/inspections/inspection-form'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/loading-skeleton'
import { getInspections } from '@/lib/inspections/actions'
import { getProperties } from '@/lib/properties/actions'
import { getProfiles } from '@/lib/profiles/actions'
import { addDaysISODate, todayISODate } from '@/lib/utils'
import type { Inspection, Property } from '@/types'

export function InspectionsList() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [properties, setProperties] = useState<Pick<Property, 'id' | 'name'>[]>([])
  const [profiles, setProfiles] = useState<{ id: string; full_name: string | null }[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  async function load(status?: string, propertyId?: string, operatorId?: string) {
    setLoading(true)
    const [insps, props, profs] = await Promise.all([
      getInspections(propertyId || undefined, status || undefined, operatorId || undefined),
      getProperties(),
      getProfiles(),
    ])
    setInspections(insps)
    setProperties(props)
    setProfiles(profs)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleFilterChange(next: { status?: string; property?: string; operator?: string }) {
    const status = next.status ?? statusFilter
    const property = next.property ?? propertyFilter
    const operator = next.operator ?? operatorFilter
    if (next.status !== undefined) setStatusFilter(next.status)
    if (next.property !== undefined) setPropertyFilter(next.property)
    if (next.operator !== undefined) setOperatorFilter(next.operator)
    startTransition(() => { load(status, property, operator) })
  }

  const visibleInspections = useMemo(() => {
    if (periodFilter === 'all') return inspections
    return inspections.filter((i: any) => {
      if (periodFilter === 'last30') return i.visit_date >= addDaysISODate(-30) && i.visit_date <= todayISODate()
      if (periodFilter === 'next30') return i.visit_date >= todayISODate() && i.visit_date <= addDaysISODate(30)
      return true
    })
  }, [inspections, periodFilter])

  const hasFilters = Boolean(statusFilter || propertyFilter || operatorFilter || periodFilter !== 'all')

  return (
    <>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Select value={statusFilter || 'all'} onValueChange={(v) => handleFilterChange({ status: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="review_pending">Revisão pendente</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyFilter || 'all'} onValueChange={(v) => handleFilterChange({ property: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas propriedades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas propriedades</SelectItem>
            {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={operatorFilter || 'all'} onValueChange={(v) => handleFilterChange({ operator: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todo operador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo operador</SelectItem>
            {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name ?? 'Sem nome'}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todo período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="last30">Últimos 30 dias</SelectItem>
            <SelectItem value="next30">Próximos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setCreating(true)} className="ml-auto">Nova vistoria</Button>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : visibleInspections.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma vistoria encontrada"
          description={hasFilters ? 'Tente outro filtro.' : 'Crie a primeira vistoria para começar.'}
          action={!hasFilters ? <Button onClick={() => setCreating(true)}>Criar vistoria</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {visibleInspections.map((inspection: any) => (
            <InspectionCard
              key={inspection.id}
              inspection={inspection}
              onEdit={() => setEditingInspection(inspection)}
              onDeleted={() => load(statusFilter, propertyFilter, operatorFilter)}
            />
          ))}
        </div>
      )}

      <InspectionForm
        open={creating}
        onClose={() => { setCreating(false); load(statusFilter, propertyFilter, operatorFilter) }}
        properties={properties as any}
      />

      {editingInspection && (
        <InspectionForm
          open={true}
          onClose={() => { setEditingInspection(null); load(statusFilter, propertyFilter, operatorFilter) }}
          inspection={editingInspection}
          properties={properties as any}
        />
      )}
    </>
  )
}
