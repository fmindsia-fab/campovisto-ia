'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { CalendarEvent, CalendarEventType } from '@/types'

export interface CalendarEventWithRelations extends CalendarEvent {
  inspections?: { id: string; properties?: { id: string; name: string } | null } | null
  activities?: { id: string; title: string } | null
  reports?: { id: string; title: string } | null
}

export async function getEvents(): Promise<CalendarEventWithRelations[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('calendar_events')
    .select('*, inspections(id, properties(id, name)), activities(id, title), reports(id, title)')
    .order('start_date', { ascending: true })

  if (error) return []
  return data as CalendarEventWithRelations[]
}

export interface EventInput {
  title: string
  event_type: CalendarEventType
  start_date: string
  end_date?: string | null
  all_day?: boolean
  inspection_id?: string | null
  activity_id?: string | null
  report_id?: string | null
}

export async function createEvent(input: EventInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { data, error } = await (supabase as any)
    .from('calendar_events')
    .insert({
      title: input.title,
      event_type: input.event_type,
      start_date: input.start_date,
      end_date: input.end_date || null,
      all_day: input.all_day ?? true,
      inspection_id: input.inspection_id || null,
      activity_id: input.activity_id || null,
      report_id: input.report_id || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as CalendarEvent, error: null }
}

export async function updateEvent(id: string, input: EventInput) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('calendar_events')
    .update({
      title: input.title,
      event_type: input.event_type,
      start_date: input.start_date,
      end_date: input.end_date || null,
      all_day: input.all_day ?? true,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any).from('calendar_events').delete().eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

// ── Sincronização automática (chamada internamente por inspections/activities) ──

export async function syncInspectionEvent(inspectionId: string, title: string, visitDate: string, userId: string) {
  const supabase = await createClient()
  const { data: existing } = await (supabase as any)
    .from('calendar_events')
    .select('id')
    .eq('inspection_id', inspectionId)
    .eq('event_type', 'visit')
    .maybeSingle()

  if (existing) {
    await (supabase as any).from('calendar_events').update({ title, start_date: visitDate }).eq('id', existing.id)
  } else {
    await (supabase as any).from('calendar_events').insert({
      title, event_type: 'visit', start_date: visitDate, inspection_id: inspectionId, created_by: userId,
    })
  }
}

export async function syncActivityEvent(activityId: string, title: string, dueDate: string | null, userId: string) {
  const supabase = await createClient()
  const { data: existing } = await (supabase as any)
    .from('calendar_events')
    .select('id')
    .eq('activity_id', activityId)
    .eq('event_type', 'activity')
    .maybeSingle()

  if (!dueDate) {
    if (existing) await (supabase as any).from('calendar_events').delete().eq('id', existing.id)
    return
  }

  if (existing) {
    await (supabase as any).from('calendar_events').update({ title, start_date: dueDate }).eq('id', existing.id)
  } else {
    await (supabase as any).from('calendar_events').insert({
      title, event_type: 'activity', start_date: dueDate, activity_id: activityId, created_by: userId,
    })
  }
}
