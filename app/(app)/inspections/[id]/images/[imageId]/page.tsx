/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnalysisRequestButton } from '@/components/ai/analysis-request-button'
import { AnalysisResult } from '@/components/ai/analysis-result'
import { getAnalysisByImage } from '@/lib/ai-analyses/actions'
import { createClient } from '@/lib/supabase/server'
import type { InspectionImage } from '@/types'

interface Props {
  params: Promise<{ id: string; imageId: string }>
}

export default async function ImageDetailPage({ params }: Props) {
  const { id: inspectionId, imageId } = await params

  const supabase = await createClient()

  const { data: image } = await (supabase as any)
    .from('inspection_images')
    .select('*')
    .eq('id', imageId)
    .single() as { data: InspectionImage | null }

  if (!image) notFound()

  const bucket = image.storage_path.startsWith('field-photos/') ? 'field-photos' : 'drone-images'
  const path = image.storage_path.replace(/^(drone-images|field-photos)\//, '')
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  const publicUrl = urlData?.publicUrl ?? ''

  const { data: analysis } = await getAnalysisByImage(imageId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href={`/inspections/${inspectionId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{image.original_name}</h1>
          <p className="text-sm text-muted-foreground">Detalhe da imagem</p>
        </div>
        <div className="ml-auto">
          <Link href={`/inspections/${inspectionId}/images/${imageId}/editor`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Crosshair className="h-3.5 w-3.5" />
              Anotar imagem
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Imagem */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl overflow-hidden border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl}
              alt={image.original_name}
              className="w-full object-contain max-h-[500px]"
            />
          </div>

          {/* Metadados */}
          {(image.image_type || image.field_observations) && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              {image.image_type && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tipo</p>
                  <p className="text-sm capitalize">{image.image_type.replace('_', ' ')}</p>
                </div>
              )}
              {image.field_observations && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações de campo</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{image.field_observations}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Painel de IA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Análise por IA</h2>

            {analysis ? (
              <AnalysisResult analysis={analysis} />
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A análise preliminar por IA identifica elementos visíveis, pontos de atenção e gera texto sugerido para o relatório. A análise deve ser revisada e aprovada por um humano antes de ir para o relatório.
                </p>
                <AnalysisRequestButton
                  imageId={imageId}
                  inspectionId={inspectionId}
                  imageUrl={publicUrl}
                  imageType={image.image_type}
                  fieldObservations={image.field_observations}
                  onSuccess={() => { window.location.reload() }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
