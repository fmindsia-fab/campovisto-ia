import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes da plataforma"
        action={<Button>Novo cliente</Button>}
      />
      <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="Adicione o primeiro cliente para começar a criar propriedades e vistorias."
        action={<Button>Adicionar cliente</Button>}
      />
    </>
  )
}
