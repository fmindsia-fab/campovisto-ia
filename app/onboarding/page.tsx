/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage() {
  const current = await getCurrentUser()
  if (!current) redirect('/login')

  if (current.profile?.onboarding_completed_at) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const userId = current.user.id

  const { data: client } = await (supabase as any)
    .from('clients')
    .select('id, name')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: property } = client
    ? await (supabase as any)
        .from('properties')
        .select('id, name')
        .eq('created_by', userId)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const { data: inspection } = property
    ? await (supabase as any)
        .from('inspections')
        .select('id')
        .eq('operator_id', userId)
        .eq('property_id', property.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  return (
    <OnboardingWizard
      initialStep={current.profile?.onboarding_step ?? 0}
      initialClient={client ?? null}
      initialProperty={property ?? null}
      initialInspection={inspection ?? null}
    />
  )
}
