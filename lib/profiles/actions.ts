'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { hasRole } from '@/lib/auth/has-role'
import type { RoleName } from '@/types'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      full_name: formData.get('full_name') || null,
      phone: formData.get('phone') || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateNotificationPreferences(preferences: Record<string, boolean>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ notification_preferences: preferences })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export interface TeamMember {
  id: string
  full_name: string | null
  email: string | null
  is_active: boolean
  roles: RoleName[]
}

export async function getTeamMembers(): Promise<TeamMember[] | { error: string }> {
  const current = await getCurrentUser()
  if (!current || !hasRole(current.roles, 'admin')) return { error: 'Apenas administradores podem ver a equipe' }

  const supabase = await createClient()

  const [{ data: profiles }, { data: userRoles }] = await Promise.all([
    (supabase as any).from('profiles').select('id, full_name, is_active').order('full_name'),
    (supabase as any).from('user_roles').select('user_id, roles(name)'),
  ])

  const rolesByUser = new Map<string, RoleName[]>()
  for (const ur of userRoles ?? []) {
    const list = rolesByUser.get(ur.user_id) ?? []
    if (ur.roles?.name) list.push(ur.roles.name)
    rolesByUser.set(ur.user_id, list)
  }

  return (profiles ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    email: null,
    is_active: p.is_active,
    roles: rolesByUser.get(p.id) ?? [],
  }))
}

export async function updateUserRoles(userId: string, roleNames: RoleName[]) {
  const current = await getCurrentUser()
  if (!current || !hasRole(current.roles, 'admin')) return { error: 'Apenas administradores podem alterar papéis' }

  const supabase = await createClient()

  const { data: roles } = await (supabase as any).from('roles').select('id, name').in('name', roleNames)
  const roleIds: string[] = (roles ?? []).map((r: any) => r.id)

  await (supabase as any).from('user_roles').delete().eq('user_id', userId)

  if (roleIds.length > 0) {
    const { error } = await (supabase as any)
      .from('user_roles')
      .insert(roleIds.map((role_id) => ({ user_id: userId, role_id })))

    if (error) return { error: error.message }
  }

  return { success: true }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const current = await getCurrentUser()
  if (!current || !hasRole(current.roles, 'admin')) return { error: 'Apenas administradores podem ativar/desativar usuários' }

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getProfiles(): Promise<{ id: string; full_name: string | null }[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  if (error) return []
  return data
}

export async function updateOnboardingStep(step: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ onboarding_step: step })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ onboarding_step: 6, onboarding_completed_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
