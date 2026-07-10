'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RoleAssignment } from './role-assignment'
import { toggleUserActive, type TeamMember } from '@/lib/profiles/actions'
import type { RoleName } from '@/types'

const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Admin',
  field_operator: 'Operador de campo',
  drone_pilot: 'Piloto de drone',
  human_reviewer: 'Revisor humano',
  client: 'Cliente',
}

interface Props {
  members: TeamMember[]
  currentUserId: string
}

export function TeamList({ members: initialMembers, currentUserId }: Props) {
  const [members, setMembers] = useState(initialMembers)
  const [editing, setEditing] = useState<TeamMember | null>(null)

  async function handleToggleActive(member: TeamMember, isActive: boolean) {
    setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, is_active: isActive } : m))
    const result = await toggleUserActive(member.id, isActive)
    if (result?.error) {
      toast.error(result.error)
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, is_active: !isActive } : m))
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium text-muted-foreground">Nome</th>
            <th className="p-3 text-left font-medium text-muted-foreground">Papéis</th>
            <th className="p-3 text-left font-medium text-muted-foreground">Ativo</th>
            <th className="p-3 text-right font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b last:border-0">
              <td className="p-3">
                {member.full_name ?? 'Sem nome'}
                {member.id === currentUserId && <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>}
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {member.roles.length === 0
                    ? <span className="text-xs text-muted-foreground">Sem papel</span>
                    : member.roles.map((r) => <Badge key={r} variant="outline" className="text-[10px]">{ROLE_LABELS[r]}</Badge>)}
                </div>
              </td>
              <td className="p-3">
                <Switch
                  checked={member.is_active}
                  disabled={member.id === currentUserId}
                  onCheckedChange={(checked) => handleToggleActive(member, checked)}
                />
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => setEditing(member)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Pencil className="h-3 w-3" />
                  Editar papéis
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <RoleAssignment
          key={editing.id}
          member={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onUpdated={(roles) => setMembers((prev) => prev.map((m) => m.id === editing.id ? { ...m, roles } : m))}
        />
      )}
    </div>
  )
}
