'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { ActivityComment } from '@/types'

export interface CommentWithAuthor extends ActivityComment {
  profiles?: { full_name: string | null } | null
}

export async function getComments(activityId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('activity_comments')
    .select('*, profiles(full_name)')
    .eq('activity_id', activityId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data as CommentWithAuthor[]
}

export async function createComment(activityId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  if (!content.trim()) return { error: 'Comentário vazio' }

  const { error } = await (supabase as any)
    .from('activity_comments')
    .insert({ activity_id: activityId, user_id: user.id, content: content.trim() })

  if (error) return { error: error.message }
  return { error: null }
}
