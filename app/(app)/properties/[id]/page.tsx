import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Tractor, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProperty } from '@/lib/properties/actions'
import { getInspections } from '@/lib/inspections/actions'
import { AddInspectionButton } from './add-inspection-button'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  in_progress: 'Em andamento',
  review_pending: 'Revisão pendente',
  completed: 'Concluída',
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  const [property, inspections] = await Promise.all([
    getProperty(id),
    getInspections(id),
  ])
  if (!property) notFound()

  return (
    <>
      <PageHeader
        title={property.name}
        description={property.clients?.name ?? 'Propriedade rural'}
        action={<AddInspectionButton propertyId={id} propertyName={property.name} />}
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

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Vistorias ({inspections.length})</h2>
      </div>

      {inspections.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma vistoria registrada"
          description="Crie a primeira vistoria para esta propriedade."
          action={<AddInspectionButton propertyId={id} propertyName={property.name} asEmptyAction />}
        />
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {inspections.map((inspection: any) => {
            const formattedDate = new Date(inspection.visit_date + 'T00:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })
            return (
              <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{formattedDate}</p>
                          {inspection.objective && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{inspection.objective}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {STATUS_LABELS[inspection.status] ?? inspection.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
