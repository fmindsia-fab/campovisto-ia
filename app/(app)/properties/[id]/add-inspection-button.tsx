'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InspectionForm } from '@/components/inspections/inspection-form'

interface Props {
  propertyId: string
  propertyName: string
  asEmptyAction?: boolean
}

export function AddInspectionButton({ propertyId, propertyName, asEmptyAction }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleClose() {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        variant={asEmptyAction ? 'default' : 'default'}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Nova vistoria
      </Button>
      <InspectionForm
        open={open}
        onClose={handleClose}
        properties={[{ id: propertyId, name: propertyName, clients: undefined }]}
        defaultPropertyId={propertyId}
      />
    </>
  )
}
