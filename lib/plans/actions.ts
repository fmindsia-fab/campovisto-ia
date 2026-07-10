'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import { getUserPlan, type Plan } from './check-limit'

export interface PlanPageData {
  plan: Plan
  usage: { properties: number; inspections: number }
  allPlans: Plan[]
}

export async function getPlanPageData(): Promise<PlanPageData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [plan, propertiesRes, inspectionsRes, allPlansRes] = await Promise.all([
    getUserPlan(user.id),
    (supabase as any).from('properties').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
    (supabase as any).from('inspections').select('id', { count: 'exact', head: true }).eq('operator_id', user.id),
    (supabase as any).from('plans').select('*').order('price_monthly'),
  ])

  return {
    plan,
    usage: {
      properties: propertiesRes.count ?? 0,
      inspections: inspectionsRes.count ?? 0,
    },
    allPlans: (allPlansRes.data as Plan[]) ?? [],
  }
}
