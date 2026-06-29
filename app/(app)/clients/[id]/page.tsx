/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation'
import { MapPin, Phone, Mail, Tractor } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { getClient } from '@/lib/clients/actions'
import { PropertyCard } from '@/components/properties/property-card'
import { AddPropertyButton } from './add-property-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) notFound()

  return (
    <>
      <PageHeader
        title={client.name}
        description="Detalhes do cliente e propriedades vinculadas"
        action={<AddPropertyButton clientId={id} clientName={client.name} />}
      />

      {/* Dados do cliente */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {client.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.city}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
          </div>
          {client.notes && (
            <p className="mt-3 text-sm text-muted-foreground">{client.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Propriedades */}
      <h2 className="mb-3 text-base font-semibold">
        Propriedades ({client.properties?.length ?? 0})
      </h2>

      {client.properties?.length === 0 ? (
        <EmptyState
          icon={Tractor}
          title="Nenhuma propriedade"
          description="Adicione uma propriedade para este cliente."
        />
      ) : (
        <div className="space-y-3">
          {client.properties?.map((property: any) => (
            <PropertyCard
              key={property.id}
              property={{ ...property, clients: client }}
              clients={[{ id: client.id, name: client.name }]}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}
    </>
  )
}
