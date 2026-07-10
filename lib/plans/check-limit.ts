/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'

export interface Plan {
  id: string
  name: string
  max_properties: number | null
  max_inspections: number | null
  max_images_per_inspection: number | null
  ai_analysis: boolean
  pdf_export: boolean
  price_monthly: number
}

export interface LimitCheck {
  allowed: boolean
  reason?: string
  code?: 'PLAN_LIMIT_REACHED'
}

const FREE_PLAN_FALLBACK: Plan = {
  id: 'free',
  name: 'Free',
  max_properties: 1,
  max_inspections: 3,
  max_images_per_inspection: 5,
  ai_analysis: false,
  pdf_export: false,
  price_monthly: 0,
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('subscriptions')
    .select('plans(*)')
    .eq('user_id', userId)
    .maybeSingle()

  return (data?.plans as Plan) ?? FREE_PLAN_FALLBACK
}

// O plano que vale pra vistoria/imagem/relatório é o de quem É DONO do
// registro (operator_id da vistoria), não o de quem está clicando no botão —
// alinhado com os triggers de banco (enforce_image_limit etc., migration 022),
// que checam a mesma coisa. Uma coisa só é evitar checagem da aplicação e
// checagem do banco discordando quando um membro da equipe age sobre uma
// vistoria de outro.
async function getInspectionOwnerPlan(inspectionId: string): Promise<Plan> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('inspections')
    .select('operator_id')
    .eq('id', inspectionId)
    .maybeSingle()

  if (!data?.operator_id) return FREE_PLAN_FALLBACK
  return getUserPlan(data.operator_id)
}

export async function checkCanCreateProperty(userId: string): Promise<LimitCheck> {
  const supabase = await createClient()
  const plan = await getUserPlan(userId)
  if (plan.max_properties == null) return { allowed: true }

  const { count } = await (supabase as any)
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', userId)

  if ((count ?? 0) >= plan.max_properties) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_REACHED',
      reason: `Plano ${plan.name} permite no máximo ${plan.max_properties} propriedade(s). Faça upgrade para cadastrar mais.`,
    }
  }
  return { allowed: true }
}

export async function checkCanCreateInspection(userId: string): Promise<LimitCheck> {
  const supabase = await createClient()
  const plan = await getUserPlan(userId)
  if (plan.max_inspections == null) return { allowed: true }

  const { count } = await (supabase as any)
    .from('inspections')
    .select('id', { count: 'exact', head: true })
    .eq('operator_id', userId)

  if ((count ?? 0) >= plan.max_inspections) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_REACHED',
      reason: `Plano ${plan.name} permite no máximo ${plan.max_inspections} vistoria(s). Faça upgrade para criar mais.`,
    }
  }
  return { allowed: true }
}

export async function checkCanUploadImage(inspectionId: string, additionalCount = 1): Promise<LimitCheck> {
  const supabase = await createClient()
  const plan = await getInspectionOwnerPlan(inspectionId)
  if (plan.max_images_per_inspection == null) return { allowed: true }

  const { count } = await (supabase as any)
    .from('inspection_images')
    .select('id', { count: 'exact', head: true })
    .eq('inspection_id', inspectionId)

  if ((count ?? 0) + additionalCount > plan.max_images_per_inspection) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_REACHED',
      reason: `Plano ${plan.name} permite no máximo ${plan.max_images_per_inspection} imagens por vistoria (já tem ${count ?? 0}). Faça upgrade para enviar mais.`,
    }
  }
  return { allowed: true }
}

export async function checkCanUseAI(inspectionId: string): Promise<LimitCheck> {
  const plan = await getInspectionOwnerPlan(inspectionId)
  if (!plan.ai_analysis) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_REACHED',
      reason: `Análise por IA não está disponível no plano ${plan.name}. Faça upgrade para o Premium.`,
    }
  }
  return { allowed: true }
}

export async function checkCanExportPdf(inspectionId: string): Promise<LimitCheck> {
  const plan = await getInspectionOwnerPlan(inspectionId)
  if (!plan.pdf_export) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_REACHED',
      reason: `Exportação de PDF não está disponível no plano ${plan.name}. Faça upgrade para o Premium.`,
    }
  }
  return { allowed: true }
}
