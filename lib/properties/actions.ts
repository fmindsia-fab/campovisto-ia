'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { checkCanCreateProperty } from '@/lib/plans/check-limit'

function parseCoord(value: FormDataEntryValue | null): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const limitCheck = await checkCanCreateProperty(user.id)
  if (!limitCheck.allowed) return { error: limitCheck.reason, code: limitCheck.code }

  const { data, error } = await (supabase as any).from('properties').insert({
    client_id: formData.get('client_id'),
    name: formData.get('name'),
    location: formData.get('location') || null,
    latitude: parseCoord(formData.get('latitude')),
    longitude: parseCoord(formData.get('longitude')),
    activity_type: formData.get('activity_type') || null,
    notes: formData.get('notes') || null,
    created_by: user.id,
  }).select().single()

  if (error) return { error: error.message }
  return { success: true, data }
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('properties').update({
    name: formData.get('name'),
    location: formData.get('location') || null,
    latitude: parseCoord(formData.get('latitude')),
    longitude: parseCoord(formData.get('longitude')),
    activity_type: formData.get('activity_type') || null,
    notes: formData.get('notes') || null,
  }).eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteProperty(id: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any).from('properties').delete().eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getProperties(search?: string, clientId?: string) {
  const supabase = await createClient()

  let query = (supabase as any)
    .from('properties')
    .select('*, clients(id, name, city)')
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('name', `%${search}%`)
  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getProperty(id: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('properties')
    .select('*, clients(id, name, city, phone, email)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
