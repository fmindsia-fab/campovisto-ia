import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'

export default function InspectionsPage() {
  return (
    <>
      <PageHeader
        title="Vistorias"
        description="Acompanhe todas as vistorias realizadas"
        action={<Button>Nova vistoria</Button>}
      />
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma vistoria registrada"
        description="Crie uma vistoria em uma propriedade para iniciar a captura de imagens."
        action={<Button>Criar vistoria</Button>}
      />
    </>
  )
}
