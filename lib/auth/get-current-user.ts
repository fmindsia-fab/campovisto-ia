import { createClient } from '@/lib/supabase/server'
import type { Profile, RoleName } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

export async function getCurrentUser() {
  const supabase: AnyClient = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: userRoleRows } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id) as { data: Array<{ role_id: string }> | null }

  const roleIds = (userRoleRows ?? []).map((r) => r.role_id)

  const { data: roleRows } = roleIds.length
    ? (await supabase.from('roles').select('name').in('id', roleIds)) as { data: Array<{ name: string }> | null }
    : { data: [] as Array<{ name: string }> }

  const roles = (roleRows ?? []).map((r) => r.name) as RoleName[]

  return { user, profile: profile as Profile | null, roles }
}
