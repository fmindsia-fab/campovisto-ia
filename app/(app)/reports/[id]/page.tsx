import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { getReportFullData } from '@/lib/reports/actions'
import { getAssignableProfiles } from '@/lib/activities/actions'
import { ReportPreview } from '@/components/reports/report-preview'
import { QuickActivitiesPanel } from '@/components/reports/quick-activities-panel'
import { PrintButton } from './print-button'
import { ShareButton } from './share-button'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const fullData = await getReportFullData(id)
  if (!fullData) notFound()

  const { report, images, annotations, analysisMap } = fullData

  const profiles = await getAssignableProfiles()
  const attentionItems = (annotations as { id: string; category: string; description: string | null; priority: string }[])
    .filter((a) => a.description)
    .map((a) => ({ id: a.id, category: a.category, description: a.description as string, priority: a.priority }))

  // gera public URLs para as imagens
  const supabase = await createClient()
  const publicUrlMap: Record<string, string> = {}
  for (const img of images) {
    const bucket = img.storage_path.startsWith('field-photos/') ? 'field-photos' : 'drone-images'
    const path = img.storage_path.replace(/^(drone-images|field-photos)\//, '')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = (supabase as any).storage.from(bucket).getPublicUrl(path)
    publicUrlMap[img.id] = data?.publicUrl ?? ''
  }

  return (
    <>
      {/* Toolbar — oculta na impressão */}
      <div className="print:hidden">
        <PageHeader
          title={report.title}
          description={report.inspections?.properties?.clients?.name ?? undefined}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reports">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Voltar
                </Link>
              </Button>
              <PrintButton />
              <ShareButton reportTitle={report.title} />
            </div>
          }
        />
      </div>

      {/* Conteúdo do relatório */}
      <div className="max-w-4xl mx-auto px-4 pb-16 print:px-0 print:pb-0 print:max-w-none space-y-6">
        <QuickActivitiesPanel
          items={attentionItems}
          inspectionId={report.inspection_id}
          reportId={report.id}
          profiles={profiles}
        />
        <ReportPreview
          report={report}
          images={images}
          annotations={annotations}
          analysisMap={analysisMap}
          publicUrlMap={publicUrlMap}
        />
      </div>
    </>
  )
}
