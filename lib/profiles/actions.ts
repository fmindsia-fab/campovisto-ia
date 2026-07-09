'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'

export async function getProfiles(): Promise<{ id: string; full_name: string | null }[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  if (error) return []
  return data
}

export async function updateOnboardingStep(step: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ onboarding_step: step })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ onboarding_step: 6, onboarding_completed_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
