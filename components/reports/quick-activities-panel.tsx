'use client'

import { useState } from 'react'
import { ListPlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ActivityForm } from '@/components/activities/activity-form'
import type { ActivityInput } from '@/lib/activities/actions'
import type { ActivityCategory } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  bovine: 'Bovino', pasture: 'Pastagem', bare_soil: 'Solo exposto', cattle_trail: 'Trilha de gado',
  wetland: 'Área úmida', fence: 'Cerca', waterer: 'Bebedouro', shade: 'Sombra', crop: 'Lavoura',
  structure: 'Estrutura', attention_point: 'Ponto de atenção',
}

const CATEGORY_TO_ACTIVITY: Record<string, ActivityCategory> = {
  bovine: 'livestock', pasture: 'pasture', bare_soil: 'soil', cattle_trail: 'other',
  wetland: 'water', fence: 'fence', waterer: 'waterer', shade: 'other', crop: 'other',
  structure: 'structure', attention_point: 'other',
}

const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' }

interface AttentionItem {
  id: string
  category: string
  description: string
  priority: string
}

interface Props {
  items: AttentionItem[]
  inspectionId: string
  reportId: string
  profiles: { id: string; full_name: string | null }[]
}

export function QuickActivitiesPanel({ items, inspectionId, reportId, profiles }: Props) {
  const [creatingFor, setCreatingFor] = useState<AttentionItem | null>(null)

  if (items.length === 0) return null

  return (
    <div className="print:hidden rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ListPlus className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Criar atividades a partir dos pontos de atenção</h3>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border p-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium">{CATEGORY_LABELS[item.category] ?? item.category}</span>
                <Badge variant="outline" className="text-[10px]">{PRIORITY_LABELS[item.priority] ?? item.priority}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => setCreatingFor(item)}>
              <Plus className="h-3 w-3" /> Atividade
            </Button>
          </div>
        ))}
      </div>

      {creatingFor && (
        <ActivityForm
          open
          onClose={() => setCreatingFor(null)}
          profiles={profiles}
          initial={{
            description: creatingFor.description,
            category: CATEGORY_TO_ACTIVITY[creatingFor.category] ?? 'other',
            priority: creatingFor.priority as ActivityInput['priority'],
            inspection_id: inspectionId,
            report_id: reportId,
            annotation_id: creatingFor.id,
          }}
        />
      )}
    </div>
  )
}
