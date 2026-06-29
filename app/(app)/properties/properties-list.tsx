'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useTransition } from 'react'
import { Search, Tractor } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/properties/property-card'
import { PropertyForm } from '@/components/properties/property-form'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/loading-skeleton'
import { getProperties } from '@/lib/properties/actions'
import { getClients } from '@/lib/clients/actions'
import type { Property, Client } from '@/types'

export function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name'>[]>([])
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  async function load(q?: string) {
    setLoading(true)
    const [propsData, clientsData] = await Promise.all([getProperties(q), getClients()])
    setProperties(propsData)
    setClients(clientsData)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleSearch(value: string) {
    setSearch(value)
    startTransition(() => { load(value) })
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar propriedades..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreating(true)}>Nova propriedade</Button>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Tractor}
          title="Nenhuma propriedade encontrada"
          description={search ? 'Tente outro termo de busca.' : 'Adicione a primeira propriedade para começar.'}
          action={!search ? <Button onClick={() => setCreating(true)}>Adicionar propriedade</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property as any}
              clients={clients}
              onEdit={() => setEditingProperty(property)}
              onDeleted={() => load(search)}
            />
          ))}
        </div>
      )}

      <PropertyForm
        open={creating}
        onClose={() => { setCreating(false); load(search) }}
        clients={clients}
      />

      {editingProperty && (
        <PropertyForm
          open={true}
          onClose={() => { setEditingProperty(null); load(search) }}
          property={editingProperty}
          clients={clients}
        />
      )}
    </>
  )
}
