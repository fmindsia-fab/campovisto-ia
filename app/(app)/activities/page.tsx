import { PageHeader } from '@/components/shared/page-header'
import { getActivities, getAssignableProfiles } from '@/lib/activities/actions'
import { getProperties } from '@/lib/properties/actions'
import { getInspections } from '@/lib/inspections/actions'
import { ActivitiesBoard } from '@/components/activities/activities-board'

interface InspectionRow {
  id: string
  visit_date: string
  properties?: { id: string; name: string } | null
}

export default async function ActivitiesPage() {
  const [activities, profiles, properties, inspections] = await Promise.all([
    getActivities(),
    getAssignableProfiles(),
    getProperties(),
    getInspections(),
  ])

  return (
    <>
      <PageHeader
        title="Atividades"
        description="Kanban de atividades recomendadas nas vistorias"
      />
      <ActivitiesBoard
        initialActivities={activities}
        profiles={profiles}
        properties={properties.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))}
        inspections={(inspections as InspectionRow[]).map((i) => ({
          id: i.id,
          label: `${i.properties?.name ?? 'Vistoria'} — ${new Date(i.visit_date + 'T00:00:00').toLocaleDateString('pt-BR')}`,
        }))}
      />
    </>
  )
}
