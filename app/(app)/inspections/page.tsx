import { PageHeader } from '@/components/shared/page-header'
import { InspectionsList } from './inspections-list'

export default function InspectionsPage() {
  return (
    <>
      <PageHeader
        title="Vistorias"
        description="Gerencie as vistorias realizadas nas propriedades"
      />
      <InspectionsList />
    </>
  )
}
