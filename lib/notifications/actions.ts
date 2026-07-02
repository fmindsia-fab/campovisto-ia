'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { hasRole } from '@/lib/auth/has-role'
import { todayISODate } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

async function notifyUser(userId: string, type: NotificationType, title: string, body: string | null, link: string | null) {
  const supabase = await createClient()

  // evita duplicar a mesma notificação (mesmo usuário/tipo/link) enquanto a condição persistir
  const { data: existing } = await (supabase as any)
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('link', link)
    .maybeSingle()

  if (existing) return

  await (supabase as any).from('notifications').insert({ user_id: userId, type, title, body, link })
}

export async function notifyReportReady(userId: string, reportId: string, reportTitle: string) {
  await notifyUser(userId, 'report_ready', 'Relatório pronto', `"${reportTitle}" está pronto para download.`, `/reports/${reportId}`)
}

// Gera (se ainda não existirem) notificações para o usuário logado a partir de
// atividades atrasadas atribuídas a ele e análises de IA pendentes de revisão há +24h
// (esta última apenas se ele tiver papel human_reviewer/admin). Chamado de forma
// preguiçosa (lazy) ao carregar notificações/dashboard — não há cron job no MVP.
async function syncSystemNotifications() {
  const current = await getCurrentUser()
  if (!current) return

  const supabase = await createClient()
  const todayISO = todayISODate()

  const { data: overdueActivities } = await (supabase as any)
    .from('activities')
    .select('id, title')
    .eq('assigned_to', current.user.id)
    .neq('status', 'done')
    .lt('due_date', todayISO)

  for (const activity of overdueActivities ?? []) {
    await notifyUser(
      current.user.id,
      'activity_overdue',
      'Atividade atrasada',
      `"${activity.title}" está com o prazo vencido.`,
      `/activities?highlight=${activity.id}`
    )
  }

  if (hasRole(current.roles, ['human_reviewer', 'admin'])) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: pendingAnalyses } = await (supabase as any)
      .from('ai_analyses')
      .select('id, inspection_id, image_id')
      .in('status', ['draft', 'review_pending'])
      .lt('created_at', cutoff)

    for (const analysis of pendingAnalyses ?? []) {
      await notifyUser(
        current.user.id,
        'analysis_pending_review',
        'Análise aguardando revisão',
        'Há uma análise de IA aguardando revisão há mais de 24 horas.',
        `/inspections/${analysis.inspection_id}/images/${analysis.image_id}`
      )
    }
  }
}

export async function getNotifications(): Promise<Notification[]> {
  await syncSystemNotifications()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await (supabase as any)
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return []
  return data as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  await syncSystemNotifications()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await (supabase as any)
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  return count ?? 0
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) return { error: error.message }
  return { error: null }
}
