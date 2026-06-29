'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createClient_(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any).from('clients').insert({
    name: formData.get('name'),
    phone: formData.get('phone') || null,
    email: formData.get('email') || null,
    city: formData.get('city') || null,
    notes: formData.get('notes') || null,
    responsible_user_id: user.id,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/clients')
  return { success: true }
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
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('clients').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/clients')
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
