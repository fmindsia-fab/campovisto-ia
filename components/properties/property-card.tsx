'use client'

import { useRouter } from 'next/navigation'
import { MapPin, Tractor, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteProperty } from '@/lib/properties/actions'
import type { Property, Client } from '@/types'

interface PropertyCardProps {
  property: Property & { clients?: Pick<Client, 'id' | 'name' | 'city'> }
  clients: Pick<Client, 'id' | 'name'>[]
  onEdit: () => void
  onDeleted?: () => void
}

export function PropertyCard({ property, onEdit, onDeleted }: PropertyCardProps) {
  const router = useRouter()

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Excluir esta propriedade?')) return
    const result = await deleteProperty(property.id)
    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`)
    } else {
      onDeleted ? onDeleted() : router.refresh()
    }
  }

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/properties/${property.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Tractor className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{property.name}</p>
              {property.clients?.name && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {property.clients.name}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {property.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{property.location}
                  </span>
                )}
                {property.activity_type && (
                  <Badge variant="outline" className="text-xs">{property.activity_type}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
