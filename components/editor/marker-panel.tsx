'use client'

import { Trash2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MarkerData } from '@/app/(app)/inspections/[id]/images/[imageId]/editor/annotation-editor'

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

const PRIORITY_COLORS: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const

interface Props {
  markers: MarkerData[]
  onSelectMarker: (m: MarkerData) => void
  onDeleteMarker: (markerNumber: number) => void
}

export function MarkerPanel({ markers, onSelectMarker, onDeleteMarker }: Props) {
  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Nenhum marcador</p>
        <p className="text-xs text-muted-foreground mt-1">
          Clique em &ldquo;Adicionar marcador&rdquo; e depois clique na imagem para posicionar.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-sm font-semibold mb-3">Marcadores ({markers.length})</p>
      <div className="space-y-2">
        {markers.map((m) => (
          <div
            key={m.marker_number}
            className="flex items-start gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectMarker(m)}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {m.marker_number}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">{CATEGORY_LABELS[m.category] ?? m.category}</p>
              {m.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{m.description}</p>
              )}
              <Badge variant={(PRIORITY_COLORS[m.priority] ?? 'secondary') as 'destructive' | 'default' | 'secondary' | 'outline'} className="mt-1 text-[10px] h-4">
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
    </div>
  )
}
