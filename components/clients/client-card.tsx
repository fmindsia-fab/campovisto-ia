'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, Building2, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClientForm } from './client-form'
import { deleteClient } from '@/lib/clients/actions'
import type { Client } from '@/types'

interface ClientCardProps {
  client: Client & { properties?: { count: number }[] }
}

export function ClientCard({ client }: ClientCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const propertiesCount = client.properties?.[0]?.count ?? 0

  async function handleDelete() {
    if (!confirm('Excluir este cliente? As propriedades vinculadas também serão removidas.')) return
    await deleteClient(client.id)
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => router.push(`/clients/${client.id}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{client.name}</p>
                {client.city && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {client.city}
                  </p>
                )}
                {client.phone && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {client.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Badge variant="secondary">{propertiesCount} prop.</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); setEditing(true) }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); handleDelete() }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientForm open={editing} onClose={() => setEditing(false)} client={client} />
    </>
  )
}
