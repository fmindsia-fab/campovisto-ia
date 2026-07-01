import { notFound } from 'next/navigation'
import { getReportFullData } from '@/lib/reports/actions'
import { ReportPreview } from '@/components/reports/report-preview'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReportPrintPage({ params }: Props) {
  const { id } = await params
  const fullData = await getReportFullData(id)
  if (!fullData) notFound()

  const { report, images, annotations, analysisMap, reviewerName } = fullData

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
    <div style={{ background: 'white', padding: '0', margin: '0' }}>
      <ReportPreview
        report={report}
        images={images}
        annotations={annotations}
        analysisMap={analysisMap}
        publicUrlMap={publicUrlMap}
        reviewerName={reviewerName}
      />
    </div>
  )
}
