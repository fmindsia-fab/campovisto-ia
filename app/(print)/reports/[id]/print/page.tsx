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
      {/* dispara window.print() apenas após todas as imagens carregarem */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function tryPrint() {
              var imgs = document.querySelectorAll('img');
              if (imgs.length === 0) { window.print(); return; }
              var loaded = 0;
              var total = imgs.length;
              function onLoad() { loaded++; if (loaded >= total) window.print(); }
              imgs.forEach(function(img) {
                if (img.complete) { onLoad(); }
                else { img.addEventListener('load', onLoad); img.addEventListener('error', onLoad); }
              });
            }
            if (document.readyState === 'complete') { setTimeout(tryPrint, 300); }
            else { window.addEventListener('load', function() { setTimeout(tryPrint, 300); }); }
          })();
        `
      }} />
    </div>
  )
}
