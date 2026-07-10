'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { updateUserRoles } from '@/lib/profiles/actions'
import type { RoleName } from '@/types'
import type { TeamMember } from '@/lib/profiles/actions'

const ALL_ROLES: { name: RoleName; label: string }[] = [
  { name: 'admin', label: 'Admin' },
  { name: 'field_operator', label: 'Operador de campo' },
  { name: 'drone_pilot', label: 'Piloto de drone' },
  { name: 'human_reviewer', label: 'Revisor humano' },
  { name: 'client', label: 'Cliente' },
]

interface Props {
  member: TeamMember
  open: boolean
  onClose: () => void
  onUpdated: (roles: RoleName[]) => void
}

export function RoleAssignment({ member, open, onClose, onUpdated }: Props) {
  const [selected, setSelected] = useState<RoleName[]>(member.roles)
  const [saving, setSaving] = useState(false)

  function toggle(role: RoleName, checked: boolean) {
    setSelected((prev) => checked ? [...prev, role] : prev.filter((r) => r !== role))
  }

  async function handleSave() {
    setSaving(true)
    const result = await updateUserRoles(member.id, selected)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Papéis atualizados')
      onUpdated(selected)
      onClose()
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Papéis de {member.full_name ?? 'usuário'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {ALL_ROLES.map((role) => (
            <label key={role.name} className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={selected.includes(role.name)}
                onCheckedChange={(checked) => toggle(role.name, checked === true)}
              />
              {role.label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
