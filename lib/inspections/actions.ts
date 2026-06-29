'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'

export async function createInspection(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any).from('inspections').insert({
    property_id: formData.get('property_id'),
    operator_id: user.id,
    visit_date: formData.get('visit_date'),
    objective: formData.get('objective') || null,
    status: formData.get('status') || 'draft',
    general_observations: formData.get('general_observations') || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateInspection(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('inspections').update({
    visit_date: formData.get('visit_date'),
    objective: formData.get('objective') || null,
    status: formData.get('status'),
    general_observations: formData.get('general_observations') || null,
  }).eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteInspection(id: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('inspections').delete().eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getInspections(propertyId?: string, status?: string) {
  const supabase = await createClient()

  let query = (supabase as any)
    .from('inspections')
    .select('*, properties(id, name, clients(id, name))')
    .order('visit_date', { ascending: false })

  if (propertyId) query = query.eq('property_id', propertyId)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getInspection(id: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('inspections')
    .select('*, properties(id, name, activity_type, clients(id, name, city))')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
