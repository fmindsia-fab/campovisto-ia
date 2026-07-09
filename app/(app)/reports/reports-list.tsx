'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FileText, CalendarDays, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addDaysISODate, todayISODate } from '@/lib/utils'
import type { ReportWithRelations } from '@/lib/reports/actions'

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

interface Props {
  reports: ReportWithRelations[]
  properties: { id: string; name: string }[]
}

export function ReportsList({ reports, properties }: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (propertyFilter !== 'all' && r.inspections?.properties?.id !== propertyFilter) return false
      if (periodFilter !== 'all') {
        const visitDate = r.inspections?.visit_date
        if (!visitDate) return false
        if (periodFilter === 'last30' && (visitDate < addDaysISODate(-30) || visitDate > todayISODate())) return false
        if (periodFilter === 'next30' && (visitDate < todayISODate() || visitDate > addDaysISODate(30))) return false
      }
      return true
    })
  }, [reports, statusFilter, propertyFilter, periodFilter])

  const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all' || periodFilter !== 'all'

  return (
    <>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="review_pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todas propriedades" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas propriedades</SelectItem>
            {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Todo período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="last30">Últimos 30 dias</SelectItem>
            <SelectItem value="next30">Próximos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum relatório encontrado"
          description={hasFilters ? 'Tente outro filtro.' : "Os relatórios são gerados a partir de vistorias com análise IA aprovada. Abra uma vistoria e clique em 'Gerar relatório'."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => {
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
