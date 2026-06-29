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
  return { data, error: null }
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

export async function updateSuggestedText(analysisId: string, suggestedText: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('ai_analyses')
    .update({ suggested_text: suggestedText, updated_at: new Date().toISOString() })
    .eq('id', analysisId)

  if (error) return { error: error.message }
  return { error: null }
}
