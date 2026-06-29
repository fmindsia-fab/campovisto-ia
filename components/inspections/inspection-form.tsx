'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createInspection, updateInspection } from '@/lib/inspections/actions'
import type { Inspection, Property, Client } from '@/types'

interface PropertyOption {
  id: string
  name: string
  clients?: { name: string }
}

interface InspectionFormProps {
  open: boolean
  onClose: () => void
  inspection?: Inspection
  properties: PropertyOption[]
  defaultPropertyId?: string
}

const STATUSES = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'review_pending', label: 'Revisão pendente' },
  { value: 'completed', label: 'Concluída' },
]

export function InspectionForm({ open, onClose, inspection, properties, defaultPropertyId }: InspectionFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>(inspection?.status ?? 'draft')

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    formData.set('status', status)
    const result = inspection
      ? await updateInspection(inspection.id, formData)
      : await createInspection(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inspection ? 'Editar vistoria' : 'Nova vistoria'}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {!inspection && (
            <div className="space-y-1.5">
              <Label htmlFor="property_id">Propriedade *</Label>
              <select
                id="property_id"
                name="property_id"
                required
                defaultValue={defaultPropertyId ?? ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Selecione uma propriedade</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.clients?.name ? ` — ${p.clients.name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visit_date">Data da visita *</Label>
              <Input
                id="visit_date"
                name="visit_date"
                type="date"
                required
                defaultValue={inspection?.visit_date ?? today}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objective">Objetivo da vistoria</Label>
            <Input
              id="objective"
              name="objective"
              placeholder="Ex: Avaliação de pastagens e rebanho"
              defaultValue={inspection?.objective ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="general_observations">Observações gerais de campo</Label>
            <Textarea
              id="general_observations"
              name="general_observations"
              rows={3}
              placeholder="Condições climáticas, acesso, outras observações..."
              defaultValue={inspection?.general_observations ?? ''}
            />
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
