import Link from 'next/link'
import { Users, MapPin, ClipboardList, FileText, Circle, PlayCircle, CheckCircle2, AlertTriangle, Eye, Sprout, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { getClients } from '@/lib/clients/actions'
import { getProperties } from '@/lib/properties/actions'
import { getInspections } from '@/lib/inspections/actions'
import { getReports } from '@/lib/reports/actions'
import { getActivities } from '@/lib/activities/actions'
import { getPendingAnalyses } from '@/lib/ai-analyses/actions'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { addDaysISODate, todayISODate } from '@/lib/utils'

export default async function DashboardPage() {
  const [clients, properties, inspections, reports, activities, pendingAnalyses, current] = await Promise.all([
    getClients(),
    getProperties(),
    getInspections(),
    getReports(),
    getActivities(),
    getPendingAnalyses(5),
    getCurrentUser(),
  ])

  const showOnboardingBanner = !current?.profile?.onboarding_completed_at

  const inspectionsInProgress = inspections.filter((i: { status: string }) => i.status === 'in_progress').length
  const recentInspections = inspections.slice(0, 5)

  const plannedCount = activities.filter((a) => a.status === 'planned').length
  const startedCount = activities.filter((a) => a.status === 'started').length
  const doneCount = activities.filter((a) => a.status === 'done').length

  const todayISO = todayISODate()
  const thresholdISO = addDaysISODate(3)
  const urgentActivities = activities
    .filter((a) => a.due_date && a.status !== 'done' && a.due_date <= thresholdISO)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 5)
  const overdueCount = activities.filter((a) => a.due_date && a.status !== 'done' && a.due_date < todayISO).length

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral das operações"
      />

      {showOnboardingBanner && (
        <Link
          href="/onboarding"
          className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Continue seu onboarding</p>
              <p className="text-xs text-muted-foreground">Termine de configurar sua primeira vistoria em poucos passos.</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Clientes" value={clients.length} icon={Users} variant="blue" />
        <StatCard title="Propriedades" value={properties.length} icon={MapPin} variant="purple" />
        <StatCard title="Vistorias em andamento" value={inspectionsInProgress} icon={ClipboardList} variant="amber" />
        <StatCard title="Relatórios gerados" value={reports.length} icon={FileText} variant="green" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Atividades planejadas" value={plannedCount} icon={Circle} variant="slate" />
        <StatCard title="Atividades iniciadas" value={startedCount} icon={PlayCircle} variant="blue" />
        <StatCard title="Atividades finalizadas" value={doneCount} icon={CheckCircle2} variant="green" />
        <StatCard title="Atividades atrasadas" value={overdueCount} icon={AlertTriangle} variant="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Vistorias recentes */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Vistorias recentes</h3>
          {recentInspections.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nenhuma vistoria ainda" description="" />
          ) : (
            <div className="space-y-2">
              {recentInspections.map((i: { id: string; visit_date: string; properties?: { name: string } | null }) => (
                <Link key={i.id} href={`/inspections/${i.id}`} className="block rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors">
                  <p className="text-xs font-medium truncate">{i.properties?.name ?? 'Vistoria'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(i.visit_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Atividades urgentes */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Atividades urgentes</h3>
          {urgentActivities.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="Nenhuma atividade urgente" description="" />
          ) : (
            <div className="space-y-2">
              {urgentActivities.map((a) => {
                const isOverdue = a.due_date! < todayISO
                return (
                  <Link key={a.id} href="/activities" className="block rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors">
                    <p className="text-xs font-medium truncate">{a.title}</p>
                    <p className={`text-[11px] ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {new Date(a.due_date! + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Análises pendentes de revisão */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Análises pendentes de revisão</h3>
          {pendingAnalyses.length === 0 ? (
            <EmptyState icon={Eye} title="Nenhuma análise pendente" description="" />
          ) : (
            <div className="space-y-2">
              {pendingAnalyses.map((a) => (
                <Link key={a.id} href={`/inspections/${a.inspection_id}/images/${a.image_id}`} className="block rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors">
                  <p className="text-xs font-medium truncate">{a.inspections?.properties?.name ?? 'Vistoria'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.inspection_images?.original_name ?? 'Imagem'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
