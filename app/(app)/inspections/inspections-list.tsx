'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useTransition } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InspectionCard } from '@/components/inspections/inspection-card'
import { InspectionForm } from '@/components/inspections/inspection-form'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/loading-skeleton'
import { getInspections } from '@/lib/inspections/actions'
import { getProperties } from '@/lib/properties/actions'
import type { Inspection, Property } from '@/types'

export function InspectionsList() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [properties, setProperties] = useState<Pick<Property, 'id' | 'name'>[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  async function load(status?: string) {
    setLoading(true)
    const [insps, props] = await Promise.all([
      getInspections(undefined, status || undefined),
      getProperties(),
    ])
    setInspections(insps)
    setProperties(props)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleStatusChange(value: string) {
    const newStatus = value === 'all' ? '' : value
    setStatusFilter(newStatus)
    startTransition(() => { load(newStatus) })
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
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
        <Button onClick={() => setCreating(true)} className="ml-auto">Nova vistoria</Button>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : inspections.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma vistoria encontrada"
          description={statusFilter ? 'Tente outro filtro.' : 'Crie a primeira vistoria para começar.'}
          action={!statusFilter ? <Button onClick={() => setCreating(true)}>Criar vistoria</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <InspectionCard
              key={inspection.id}
              inspection={inspection as any}
              onEdit={() => setEditingInspection(inspection)}
              onDeleted={() => load(statusFilter)}
            />
          ))}
        </div>
      )}

      <InspectionForm
        open={creating}
        onClose={() => { setCreating(false); load(statusFilter) }}
        properties={properties as any}
      />

      {editingInspection && (
        <InspectionForm
          open={true}
          onClose={() => { setEditingInspection(null); load(statusFilter) }}
          inspection={editingInspection}
          properties={properties as any}
        />
      )}
    </>
  )
}
