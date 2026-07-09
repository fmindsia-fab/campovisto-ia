import { PageHeader } from '@/components/shared/page-header'
import { getReports } from '@/lib/reports/actions'
import { getProperties } from '@/lib/properties/actions'
import { ReportsList } from './reports-list'

export default async function ReportsPage() {
  const [reports, properties] = await Promise.all([
    getReports(),
    getProperties(),
  ])

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Relatórios gerados a partir das vistorias aprovadas"
      />

      <ReportsList reports={reports} properties={properties.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))} />
    </>
  )
}
