'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PropertyForm } from '@/components/properties/property-form'

interface Props {
  clientId: string
  clientName: string
}

export function AddPropertyButton({ clientId, clientName }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleClose() {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nova propriedade</Button>
      <PropertyForm
        open={open}
        onClose={handleClose}
        clients={[{ id: clientId, name: clientName }]}
        defaultClientId={clientId}
      />
    </>
  )
}
