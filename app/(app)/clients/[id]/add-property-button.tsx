'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PropertyForm } from '@/components/properties/property-form'

interface Props {
  clientId: string
  clientName: string
}

export function AddPropertyButton({ clientId, clientName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nova propriedade</Button>
      <PropertyForm
        open={open}
        onClose={() => setOpen(false)}
        clients={[{ id: clientId, name: clientName }]}
        defaultClientId={clientId}
      />
    </>
  )
}
