import { notFound } from 'next/navigation'
import { CalendarDays, Tractor } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getInspection } from '@/lib/inspections/actions'
import { getInspectionImages } from '@/lib/inspection-images/actions'
import { getAnalysisSummariesByInspection } from '@/lib/ai-analyses/actions'
import { getReportByInspection } from '@/lib/reports/actions'
import { InspectionImageSection } from './inspection-image-section'
import { GenerateReportButton } from './generate-report-button'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  in_progress: 'Em andamento',
  review_pending: 'Revisão pendente',
  completed: 'Concluída',
}

export default async function InspectionDetailPage({ params }: Props) {
  const { id } = await params
  const [inspection, images, analysisSummaries, existingReport] = await Promise.all([
    getInspection(id),
    getInspectionImages(id),
    getAnalysisSummariesByInspection(id),
    getReportByInspection(id),
  ])
  if (!inspection) notFound()

  const hasApprovedAnalysis = Object.values(analysisSummaries).some((s) => s.status === 'approved')

  const formattedDate = new Date(inspection.visit_date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <>
      <PageHeader
        title={inspection.properties?.name ?? 'Vistoria'}
        description={`${inspection.properties?.clients?.name ?? ''} · ${formattedDate}`}
        action={hasApprovedAnalysis ? (
          <GenerateReportButton
            inspectionId={id}
            propertyName={inspection.properties?.name ?? 'Vistoria'}
            visitDate={inspection.visit_date}
            existingReportId={existingReport?.id ?? null}
          />
        ) : undefined}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2">
          <CardContent className="p-5 space-y-3">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              {inspection.properties?.activity_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Tractor className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{inspection.properties.activity_type}</Badge>
                </div>
              )}
              <Badge>{STATUS_LABELS[inspection.status] ?? inspection.status}</Badge>
            </div>
            {inspection.objective && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objetivo</p>
                <p className="text-sm">{inspection.objective}</p>
              </div>
            )}
            {inspection.general_observations && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Observações gerais</p>
                <p className="text-sm text-muted-foreground">{inspection.general_observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Próximas etapas</p>
            {(() => {
              const hasImages = images.length > 0
              const hasAnalysis = Object.keys(analysisSummaries).length > 0
              const hasReport = !!existingReport
              const steps = [
                { label: 'Upload de imagens', done: hasImages },
                { label: 'Anotações visuais', done: hasImages },
                { label: 'Análise por IA', done: hasAnalysis },
                { label: 'Revisão humana', done: hasApprovedAnalysis },
                { label: 'Relatório gerado', done: hasReport },
              ]
              return (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {steps.map((step) => (
                    <p key={step.label} className="flex items-center gap-2">
                      <span className={step.done ? 'text-primary' : ''}>
                        {step.done ? '✓' : '○'}
                      </span>
                      {step.label}
                    </p>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      <InspectionImageSection inspectionId={id} initialImages={images} analysisSummaries={analysisSummaries} />
    </>
  )
}
