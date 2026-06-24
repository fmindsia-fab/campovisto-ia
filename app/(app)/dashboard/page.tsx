import { PageHeader } from '@/components/shared/page-header'
import { StatGridSkeleton } from '@/components/shared/loading-skeleton'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral das operações"
      />
      <StatGridSkeleton />
    </>
  )
}
