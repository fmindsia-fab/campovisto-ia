import { PageHeader } from '@/components/shared/page-header'
import { ClientsList } from './clients-list'

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes da plataforma"
      />
      <ClientsList />
    </>
  )
}
