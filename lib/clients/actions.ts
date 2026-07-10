'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { hasRole } from '@/lib/auth/has-role'

export async function createClient_(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await (supabase as any).from('clients').insert({
    name: formData.get('name'),
    phone: formData.get('phone') || null,
    email: formData.get('email') || null,
    city: formData.get('city') || null,
    notes: formData.get('notes') || null,
    responsible_user_id: user.id,
    created_by: user.id,
  }).select().single()

  if (error) return { error: error.message }
  return { success: true, data }
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('clients').update({
    name: formData.get('name'),
    phone: formData.get('phone') || null,
    email: formData.get('email') || null,
    city: formData.get('city') || null,
    notes: formData.get('notes') || null,
  }).eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('clients').delete().eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getClients(search?: string) {
  const supabase = await createClient()

  let query = (supabase as any)
    .from('clients')
    .select('*, properties(count)')
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return []
  return data
}

export interface ClientOption { id: string; name: string; linked_user_id: string | null }

// admin usa isso pra saber quais registros de cliente existem ao vincular
// um usuário de papel `client` — precisa ver todos independente de vínculo
export async function getClientOptions(): Promise<ClientOption[]> {
  const current = await getCurrentUser()
  if (!current || !hasRole(current.roles, 'admin')) return []

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('clients')
    .select('id, name, linked_user_id')
    .order('name')

  if (error) return []
  return data
}

// Vincula (ou desvincula, se clientId for null) um usuário a um registro de
// cliente. Um usuário só pode estar vinculado a um cliente por vez — libera
// qualquer vínculo anterior antes de aplicar o novo.
export async function linkClientUser(clientId: string | null, userId: string) {
  const current = await getCurrentUser()
  if (!current || !hasRole(current.roles, 'admin')) return { error: 'Apenas administradores podem vincular clientes' }

  const supabase = await createClient()

  if (clientId) {
    const { data: target } = await (supabase as any)
      .from('clients')
      .select('linked_user_id')
      .eq('id', clientId)
      .maybeSingle()

    if (target?.linked_user_id && target.linked_user_id !== userId) {
      return { error: 'Esse cliente já está vinculado a outro usuário' }
    }
  }

  await (supabase as any).from('clients').update({ linked_user_id: null }).eq('linked_user_id', userId)

  if (clientId) {
    const { error } = await (supabase as any)
      .from('clients')
      .update({ linked_user_id: userId })
      .eq('id', clientId)

    if (error) return { error: error.message }
  }

  return { success: true }
}

export async function getClient(id: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('clients')
    .select('*, properties(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
