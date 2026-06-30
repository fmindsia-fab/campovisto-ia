'use client'

import { Trash2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MarkerData } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  bovine: 'Bovino',
  pasture: 'Pastagem',
  bare_soil: 'Solo exposto',
  cattle_trail: 'Trilha de gado',
  wetland: 'Área úmida',
  fence: 'Cerca',
  waterer: 'Bebedouro',
  shade: 'Sombra',
  crop: 'Lavoura',
  structure: 'Estrutura',
  attention_point: 'Ponto de atenção',
}

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

const PRIORITIES = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
]

const CONFIDENCES = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'probable', label: 'Provável' },
  { value: 'uncertain', label: 'Incerto' },
]

const CATEGORY_DOT_COLORS: Record<string, string> = {
  bovine: '#f97316',
  pasture: '#22c55e',
  bare_soil: '#a78b5c',
  cattle_trail: '#8b5cf6',
  wetland: '#06b6d4',
  fence: '#6b7280',
  waterer: '#3b82f6',
  shade: '#84cc16',
  crop: '#10b981',
  structure: '#64748b',
  attention_point: '#ef4444',
  pasture_degradation: '#ef4444',
  water_stress: '#f97316',
  low_biomass: '#eab308',
  nutrient_deficiency: '#a78b5c',
  healthy_vegetation: '#22c55e',
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
}

interface Template {
  category: string
  priority: string
  confidence: string
}

interface Props {
  markers: MarkerData[]
  template: Template
  addingMode: boolean
  onTemplateChange: (t: Template) => void
  onSelectMarker: (m: MarkerData) => void
  onDeleteMarker: (markerNumber: number) => void
}

export function MarkerPanel({ markers, template, addingMode, onTemplateChange, onSelectMarker, onDeleteMarker }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Template de configuração */}
      <div className="p-4 border-b space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Configuração do marcador
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {addingMode
            ? 'Clique na imagem para adicionar marcadores com esta configuração.'
            : 'Defina o tipo e clique em "Adicionar marcador" para começar.'}
        </p>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Categoria</Label>
            <Select
              value={template.category}
              onValueChange={(v) => onTemplateChange({ ...template, category: v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Prioridade</Label>
              <Select
                value={template.priority}
                onValueChange={(v) => onTemplateChange({ ...template, priority: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Confiança</Label>
              <Select
                value={template.confidence}
                onValueChange={(v) => onTemplateChange({ ...template, confidence: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONFIDENCES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de marcadores */}
      <div className="flex-1 overflow-y-auto p-4">
        {markers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MapPin className="h-7 w-7 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhum marcador ainda. Configure acima e clique em &ldquo;Adicionar marcador&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Marcadores ({markers.length})</p>
            {markers.map((m) => (
              <div
                key={m.marker_number}
                className="flex items-start gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelectMarker(m)}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: CATEGORY_DOT_COLORS[m.category] ?? '#f59e0b' }}
                >
                  {m.marker_number}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{CATEGORY_LABELS[m.category] ?? m.category}</p>
                  {m.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                  )}
                  <Badge
                    variant={(PRIORITY_COLORS[m.priority] ?? 'secondary') as 'destructive' | 'default' | 'secondary' | 'outline'}
                    className="mt-1 text-[10px] h-4"
                  >
                    {m.priority === 'high' ? 'Alta' : m.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDeleteMarker(m.marker_number) }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
