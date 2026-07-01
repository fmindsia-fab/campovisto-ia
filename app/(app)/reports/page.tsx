import Link from 'next/link'
import { FileText, CalendarDays, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { getReports } from '@/lib/reports/actions'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  review_pending: 'Pendente',
  approved: 'Aprovado',
  published: 'Publicado',
}

const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border',
  review_pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  published: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default async function ReportsPage() {
  const reports = await getReports()

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Relatórios gerados a partir das vistorias aprovadas"
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum relatório ainda"
          description="Os relatórios são gerados a partir de vistorias com análise IA aprovada. Abra uma vistoria e clique em 'Gerar relatório'."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const property = report.inspections?.properties
            const client = property?.clients
            const visitDate = report.inspections?.visit_date
              ? new Date(report.inspections.visit_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : null

            return (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-tight line-clamp-2">{report.title}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASSES[report.status] ?? 'bg-muted'}`}>
                        {STATUS_LABELS[report.status] ?? report.status}
                      </span>
                    </div>

                    {property && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{property.name}</span>
                        {client && <span className="truncate">· {client.name}</span>}
                      </div>
                    )}

                    {visitDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span>{visitDate}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
