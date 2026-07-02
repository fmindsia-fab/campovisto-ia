'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { Activity, ActivityCategory, ActivityStatus, Priority } from '@/types'

export interface ActivityWithRelations extends Activity {
  inspections?: {
    id: string
    visit_date: string
    properties?: {
      id: string
      name: string
      clients?: { id: string; name: string }
    }
  } | null
  assigned_profile?: { id: string; full_name: string | null } | null
}

const SELECT_WITH_RELATIONS = '*, inspections(id, visit_date, properties(id, name, clients(id, name))), assigned_profile:profiles(id, full_name)'

export async function getActivities(): Promise<ActivityWithRelations[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('activities')
    .select(SELECT_WITH_RELATIONS)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as ActivityWithRelations[]
}

export async function getActivity(id: string): Promise<ActivityWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('activities')
    .select(SELECT_WITH_RELATIONS)
    .eq('id', id)
    .single()

  if (error) return null
  return data as ActivityWithRelations
}

export interface ActivityInput {
  title: string
  description?: string | null
  category?: ActivityCategory | null
  priority: Priority
  assigned_to?: string | null
  due_date?: string | null
  inspection_id?: string | null
  report_id?: string | null
  annotation_id?: string | null
}

export async function createActivity(input: ActivityInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { data, error } = await (supabase as any)
    .from('activities')
    .insert({
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      priority: input.priority,
      assigned_to: input.assigned_to || null,
      due_date: input.due_date || null,
      inspection_id: input.inspection_id || null,
      report_id: input.report_id || null,
      annotation_id: input.annotation_id || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Activity, error: null }
}

export async function updateActivity(id: string, input: ActivityInput) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('activities')
    .update({
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      priority: input.priority,
      assigned_to: input.assigned_to || null,
      due_date: input.due_date || null,
      inspection_id: input.inspection_id || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function updateActivityStatus(id: string, status: ActivityStatus) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('activities')
    .update({
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteActivity(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any).from('activities').delete().eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function getAssignableProfiles(): Promise<{ id: string; full_name: string | null }[]> {
  const supabase = await createClient()
  const { data } = await (supabase as any).from('profiles').select('id, full_name').order('full_name')
  return data ?? []
}
