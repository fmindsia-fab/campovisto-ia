import { PageHeader } from '@/components/shared/page-header'
import { PropertiesList } from './properties-list'

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        title="Propriedades"
        description="Gerencie as propriedades rurais cadastradas"
      />
      <PropertiesList />
    </>
  )
}
