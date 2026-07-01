'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { Report } from '@/types'

export async function createReport(inspectionId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Não autenticado' }

  const { data, error } = await (supabase as any)
    .from('reports')
    .insert({ inspection_id: inspectionId, title, generated_by: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Report, error: null }
}

export async function getReports() {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('reports')
    .select('*, inspections(id, visit_date, objective, properties(id, name, clients(id, name)))')
    .order('created_at', { ascending: false })

  if (error) return []
  return data as ReportWithRelations[]
}

export async function getReport(id: string) {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('reports')
    .select('*, inspections(id, visit_date, objective, general_observations, properties(id, name, location, activity_type, clients(id, name, phone, email, city)))')
    .eq('id', id)
    .single()

  if (error) return null
  return data as ReportWithRelations
}

export async function getReportFullData(reportId: string) {
  const supabase = await createClient()

  const report = await getReport(reportId)
  if (!report) return null

  const inspectionId = report.inspection_id

  // busca imagens com anotações e análises
  const { data: images } = await (supabase as any)
    .from('inspection_images')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('order_index', { ascending: true })

  const imageIds: string[] = (images ?? []).map((img: any) => img.id)

  const { data: annotations } = imageIds.length > 0
    ? await (supabase as any)
        .from('image_annotations')
        .select('*')
        .in('image_id', imageIds)
        .order('marker_number', { ascending: true })
    : { data: [] }

  const { data: analyses } = imageIds.length > 0
    ? await (supabase as any)
        .from('ai_analyses')
        .select('*')
        .in('image_id', imageIds)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
    : { data: [] }

  // deduplica análises por image_id (pega a mais recente aprovada)
  const analysisMap: Record<string, any> = {}
  for (const a of (analyses ?? [])) {
    if (!analysisMap[a.image_id]) analysisMap[a.image_id] = a
  }

  // busca nome do revisor humano (pega o primeiro encontrado)
  let reviewerName: string | null = null
  for (const a of Object.values(analysisMap)) {
    if (a.reviewed_by) {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('full_name')
        .eq('id', a.reviewed_by)
        .single()
      reviewerName = profile?.full_name ?? null
      break
    }
  }

  return {
    report,
    images: images ?? [],
    annotations: annotations ?? [],
    analysisMap,
    reviewerName,
  }
}

export async function getReportByInspection(inspectionId: string) {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('reports')
    .select('id, inspection_id')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as { id: string; inspection_id: string } | null
}

export async function deleteReport(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any).from('reports').delete().eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

// Tipos de retorno com relações
export interface ReportWithRelations extends Report {
  inspections?: {
    id: string
    visit_date: string
    objective: string | null
    general_observations: string | null
    properties?: {
      id: string
      name: string
      location: string | null
      activity_type: string | null
      clients?: {
        id: string
        name: string
        phone: string | null
        email: string | null
        city: string | null
      }
    }
  }
}
