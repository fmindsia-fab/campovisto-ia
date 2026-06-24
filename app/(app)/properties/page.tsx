import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        title="Propriedades"
        description="Gerencie as propriedades rurais cadastradas"
        action={<Button>Nova propriedade</Button>}
      />
      <EmptyState
        icon={MapPin}
        title="Nenhuma propriedade cadastrada"
        description="Vincule uma propriedade a um cliente para iniciar vistorias com drone."
        action={<Button>Adicionar propriedade</Button>}
      />
    </>
  )
}
