'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/shared/phone-input'
import { updateProfile } from '@/lib/profiles/actions'

interface Props {
  fullName: string | null
  phone: string | null
}

export function ProfileForm({ fullName, phone }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateProfile(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Perfil atualizado')
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" name="full_name" defaultValue={fullName ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <PhoneInput defaultValue={phone ?? ''} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
