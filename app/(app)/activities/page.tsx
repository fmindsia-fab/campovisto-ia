import { PageHeader } from '@/components/shared/page-header'
import { getActivities, getAssignableProfiles } from '@/lib/activities/actions'
import { getProperties } from '@/lib/properties/actions'
import { ActivitiesBoard } from '@/components/activities/activities-board'

export default async function ActivitiesPage() {
  const [activities, profiles, properties] = await Promise.all([
    getActivities(),
    getAssignableProfiles(),
    getProperties(),
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
      />
    </>
  )
}
