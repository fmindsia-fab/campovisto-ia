'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tractor } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PropertyCard } from '@/components/properties/property-card'
import { PropertyForm } from '@/components/properties/property-form'
import type { Property, Client } from '@/types'

interface Props {
  properties: Property[]
  client: Pick<Client, 'id' | 'name'>
}

export function ClientPropertiesList({ properties, client }: Props) {
  const router = useRouter()
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [list, setList] = useState(properties)

  function handleDeleted(id: string) {
    setList((prev) => prev.filter((p) => p.id !== id))
  }

  function handleEdited() {
    setEditingProperty(null)
    router.refresh()
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={Tractor}
        title="Nenhuma propriedade"
        description="Adicione uma propriedade para este cliente."
      />
    )
  }

  return (
    <>
      <div className="space-y-3">
        {list.map((property) => (
          <PropertyCard
            key={property.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            property={property as any}
            clients={[client]}
            onEdit={() => setEditingProperty(property)}
            onDeleted={() => handleDeleted(property.id)}
          />
        ))}
      </div>

      {editingProperty && (
        <PropertyForm
          open={true}
          onClose={handleEdited}
          property={editingProperty}
          clients={[client]}
        />
      )}
    </>
  )
}
