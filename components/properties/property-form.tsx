'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createProperty, updateProperty } from '@/lib/properties/actions'
import type { Property, Client } from '@/types'

const ACTIVITY_TYPES = [
  'Pecuária bovina',
  'Pecuária leiteira',
  'Agricultura - grãos',
  'Agricultura - cana',
  'Agricultura - fruticultura',
  'Silvicultura',
  'Aquicultura',
  'Misto',
  'Outro',
]

interface PropertyFormProps {
  open: boolean
  onClose: () => void
  property?: Property
  clients: Pick<Client, 'id' | 'name'>[]
  defaultClientId?: string
}

export function PropertyForm({ open, onClose, property, clients, defaultClientId }: PropertyFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activityType, setActivityType] = useState(property?.activity_type ?? '')

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    formData.set('activity_type', activityType)
    const result = property
      ? await updateProperty(property.id, formData)
      : await createProperty(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{property ? 'Editar propriedade' : 'Nova propriedade'}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {!property && (
            <div className="space-y-1.5">
              <Label htmlFor="client_id">Cliente *</Label>
              <select
                id="client_id"
                name="client_id"
                required
                defaultValue={defaultClientId ?? ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da propriedade *</Label>
            <Input id="name" name="name" required defaultValue={property?.name} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Localização</Label>
            <Input id="location" name="location" placeholder="Município, estado" defaultValue={property?.location ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de atividade</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={property?.notes ?? ''} />
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
