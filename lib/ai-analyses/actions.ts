'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'

export async function getAnalysisByImage(imageId: string) {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('ai_analyses')
    .select('*')
    .eq('image_id', imageId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: null }

  // busca nome do revisor se houver
  let reviewerName: string | null = null
  if (data.reviewed_by) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('full_name')
      .eq('id', data.reviewed_by)
      .single()
    reviewerName = profile?.full_name ?? null
  }

  return { data: { ...data, reviewer_name: reviewerName }, error: null }
}

export async function approveAnalysis(analysisId: string, reviewerNotes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('ai_analyses')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', analysisId)

  if (error) return { error: error.message }
  return { error: null }
}

export async function rejectAnalysis(analysisId: string, reviewerNotes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('ai_analyses')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', analysisId)

  if (error) return { error: error.message }
  return { error: null }
}

export async function getAnalysisStatusByInspection(inspectionId: string): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('ai_analyses')
    .select('image_id, status')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: false })

  if (!data) return {}
  const map: Record<string, string> = {}
  for (const row of data as { image_id: string; status: string }[]) {
    if (!map[row.image_id]) map[row.image_id] = row.status
  }
  return map
}

export interface AnalysisSummary {
  status: string
  suggestedText: string | null
}

export async function getAnalysisSummariesByInspection(inspectionId: string): Promise<Record<string, AnalysisSummary>> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('ai_analyses')
    .select('image_id, status, suggested_text')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: false })

  if (!data) return {}
  const map: Record<string, AnalysisSummary> = {}
  for (const row of data as { image_id: string; status: string; suggested_text: string | null }[]) {
    if (!map[row.image_id]) map[row.image_id] = { status: row.status, suggestedText: row.suggested_text }
  }
  return map
}

export async function updateSuggestedText(analysisId: string, suggestedText: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('ai_analyses')
    .update({ suggested_text: suggestedText, updated_at: new Date().toISOString() })
    .eq('id', analysisId)

  if (error) return { error: error.message }
  return { error: null }
}
