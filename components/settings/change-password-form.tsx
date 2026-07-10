'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/lib/auth/actions'

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    const result = await changePassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      toast.success('Senha alterada com sucesso')
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current_password">Senha atual</Label>
        <Input id="current_password" name="current_password" type="password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new_password">Nova senha</Label>
        <Input id="new_password" name="new_password" type="password" required minLength={6} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">Confirmar nova senha</Label>
        <Input id="confirm_password" name="confirm_password" type="password" required minLength={6} />
      </div>
      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Alterando...' : 'Alterar senha'}
      </Button>
    </form>
  )
}
