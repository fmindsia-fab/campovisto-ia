'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/clients/client-card'
import { ClientForm } from '@/components/clients/client-form'
import { EmptyState } from '@/components/shared/empty-state'
import { ListSkeleton } from '@/components/shared/loading-skeleton'
import { getClients } from '@/lib/clients/actions'
import { Users } from 'lucide-react'
import type { Client } from '@/types'

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  async function load(q?: string) {
    setLoading(true)
    const data = await getClients(q)
    setClients(data)
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
            placeholder="Buscar clientes..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreating(true)}>Novo cliente</Button>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description={search ? 'Tente outro termo de busca.' : 'Adicione o primeiro cliente para começar.'}
          action={!search ? <Button onClick={() => setCreating(true)}>Adicionar cliente</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client as any}
              onDeleted={() => load(search)}
            />
          ))}
        </div>
      )}

      <ClientForm
        open={creating}
        onClose={() => { setCreating(false); load(search) }}
      />
    </>
  )
}
