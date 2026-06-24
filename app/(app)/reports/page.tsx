import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Relatórios gerados a partir das vistorias aprovadas"
      />
      <EmptyState
        icon={FileText}
        title="Nenhum relatório disponível"
        description="Os relatórios são gerados automaticamente após a aprovação humana da análise de IA."
      />
    </>
  )
}
