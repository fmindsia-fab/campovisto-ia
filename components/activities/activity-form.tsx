'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createActivity, updateActivity, type ActivityInput, type ActivityWithRelations } from '@/lib/activities/actions'
import type { ActivityCategory, Priority } from '@/types'

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  fence: 'Cerca',
  waterer: 'Bebedouro',
  pasture: 'Pastagem',
  soil: 'Solo',
  livestock: 'Rebanho',
  water: 'Água',
  structure: 'Estrutura',
  inspection: 'Vistoria',
  other: 'Outro',
}

const PRIORITY_LABELS: Record<Priority, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' }

interface Props {
  open: boolean
  onClose: () => void
  activity?: ActivityWithRelations
  profiles: { id: string; full_name: string | null }[]
  inspections?: { id: string; label: string }[]
  initial?: Partial<ActivityInput>
}

export function ActivityForm({ open, onClose, activity, profiles, inspections = [], initial }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>(activity?.category ?? initial?.category ?? '')
  const [priority, setPriority] = useState<string>(activity?.priority ?? initial?.priority ?? 'medium')
  const [assignedTo, setAssignedTo] = useState<string>(activity?.assigned_to ?? initial?.assigned_to ?? '')
  const [inspectionId, setInspectionId] = useState<string>(activity?.inspection_id ?? initial?.inspection_id ?? '')

  // vínculo com vistoria fixo quando a atividade vem de um ponto de atenção do relatório
  const inspectionLocked = !!initial?.inspection_id

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    const input: ActivityInput = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      category: (category || null) as ActivityCategory | null,
      priority: priority as Priority,
      assigned_to: assignedTo || null,
      due_date: (formData.get('due_date') as string) || null,
      inspection_id: inspectionLocked ? initial?.inspection_id ?? null : inspectionId || null,
      report_id: initial?.report_id ?? null,
      annotation_id: initial?.annotation_id ?? null,
    }

    const result = activity
      ? await updateActivity(activity.id, input)
      : await createActivity(input)

    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{activity ? 'Editar atividade' : 'Nova atividade'}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required defaultValue={activity?.title ?? initial?.description?.slice(0, 60) ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={activity?.description ?? initial?.description ?? ''} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [ActivityCategory, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!inspectionLocked && (
            <div className="space-y-1.5">
              <Label>Propriedade / vistoria</Label>
              <Select value={inspectionId} onValueChange={setInspectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (atividade avulsa)" />
                </SelectTrigger>
                <SelectContent>
                  {inspections.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Ninguém" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name ?? 'Sem nome'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Prazo</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={activity?.due_date ?? ''} />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
