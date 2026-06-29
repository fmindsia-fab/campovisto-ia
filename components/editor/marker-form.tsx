'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MarkerData } from '@/app/(app)/inspections/[id]/images/[imageId]/editor/annotation-editor'

const CATEGORIES = [
  { value: 'bovine', label: 'Bovino' },
  { value: 'pasture', label: 'Pastagem' },
  { value: 'bare_soil', label: 'Solo exposto' },
  { value: 'cattle_trail', label: 'Trilha de gado' },
  { value: 'wetland', label: 'Área úmida' },
  { value: 'fence', label: 'Cerca' },
  { value: 'waterer', label: 'Bebedouro' },
  { value: 'shade', label: 'Sombra' },
  { value: 'crop', label: 'Lavoura' },
  { value: 'structure', label: 'Estrutura' },
  { value: 'attention_point', label: 'Ponto de atenção' },
]

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

interface Props {
  marker: MarkerData
  onUpdate: (m: MarkerData) => void
  onDelete: () => void
  onClose: () => void
}

export function MarkerForm({ marker, onUpdate, onDelete, onClose }: Props) {
  const [category, setCategory] = useState(marker.category)
  const [priority, setPriority] = useState(marker.priority)
  const [confidence, setConfidence] = useState(marker.confidence)
  const [description, setDescription] = useState(marker.description ?? '')

  function handleApply() {
    onUpdate({
      ...marker,
      category,
      priority,
      confidence,
      description: description || null,
    })
    onClose()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {marker.marker_number}
          </div>
          <span className="text-sm font-semibold">Marcador {marker.marker_number}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
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

        <div className="space-y-1.5">
          <Label className="text-xs">Descrição</Label>
          <Textarea
            className="text-xs resize-none"
            rows={3}
            placeholder="Descreva o que foi observado..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
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

          <div className="space-y-1.5">
            <Label className="text-xs">Confiança</Label>
            <Select value={confidence} onValueChange={setConfidence}>
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

        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleApply}>
            Aplicar
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
