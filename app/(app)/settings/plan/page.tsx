import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { UsageBar } from '@/components/plans/usage-bar'
import { PlanComparison } from '@/components/plans/plan-comparison'
import { UpgradeButton } from '@/components/plans/upgrade-button'
import { getPlanPageData } from '@/lib/plans/actions'

export default async function PlanPage() {
  const data = await getPlanPageData()
  if (!data) redirect('/login')

  const { plan, usage, allPlans } = data
  const isPremium = plan.id !== 'free'

  return (
    <>
      <PageHeader title="Plano" description="Seu plano atual, uso e limites" />

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Plano atual</p>
              <p className="text-lg font-semibold">{plan.name}</p>
            </div>
            {!isPremium && <UpgradeButton />}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <UsageBar label="Propriedades" used={usage.properties} limit={plan.max_properties} />
            <UsageBar label="Vistorias" used={usage.inspections} limit={plan.max_inspections} />
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-sm font-semibold">Comparar planos</h2>
      <PlanComparison plans={allPlans} currentPlanId={plan.id} />
    </>
  )
}
