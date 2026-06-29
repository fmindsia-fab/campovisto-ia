import { notFound } from 'next/navigation'
import { MapPin, Tractor, ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProperty } from '@/lib/properties/actions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  const property = await getProperty(id)
  if (!property) notFound()

  return (
    <>
      <PageHeader
        title={property.name}
        description={property.clients?.name ?? 'Propriedade rural'}
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-4">
            {property.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{property.location}</span>
              </div>
            )}
            {property.activity_type && (
              <div className="flex items-center gap-2 text-sm">
                <Tractor className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{property.activity_type}</Badge>
              </div>
            )}
          </div>
          {property.notes && (
            <p className="mt-3 text-sm text-muted-foreground">{property.notes}</p>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-3 text-base font-semibold">Vistorias</h2>
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma vistoria registrada"
        description="As vistorias desta propriedade aparecerão aqui. Implementado no M4."
      />
    </>
  )
}
