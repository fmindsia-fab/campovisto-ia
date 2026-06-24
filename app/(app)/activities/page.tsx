import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { CheckSquare } from 'lucide-react'

export default function ActivitiesPage() {
  return (
    <>
      <PageHeader
        title="Atividades"
        description="Kanban de atividades recomendadas nas vistorias"
        action={<Button>Nova atividade</Button>}
      />
      <EmptyState
        icon={CheckSquare}
        title="Nenhuma atividade registrada"
        description="As atividades são geradas a partir das recomendações dos relatórios de vistoria."
        action={<Button>Criar atividade</Button>}
      />
    </>
  )
}
