'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { ImageIcon, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/inspections/image-uploader'
import { ImageCard } from '@/components/inspections/image-card'
import { EmptyState } from '@/components/shared/empty-state'
import { createBrowserClient } from '@supabase/ssr'
import { getInspectionImages } from '@/lib/inspection-images/actions'
import type { AnalysisSummary } from '@/lib/ai-analyses/actions'
import type { InspectionImage } from '@/types'

interface Props {
  inspectionId: string
  initialImages: InspectionImage[]
  analysisSummaries: Record<string, AnalysisSummary>
}

export function InspectionImageSection({ inspectionId, initialImages, analysisSummaries }: Props) {
  const [images, setImages] = useState<InspectionImage[]>(initialImages)
  const [showUploader, setShowUploader] = useState(initialImages.length === 0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function reload() {
    const fresh = await getInspectionImages(inspectionId)
    setImages(fresh)
  }

  function getPublicUrl(storagePath: string) {
    const bucket = storagePath.startsWith('field-photos/') ? 'field-photos' : 'drone-images'
    const path = storagePath.replace(/^(drone-images|field-photos)\//, '')
    const { data } = (supabase as any).storage.from(bucket).getPublicUrl(path)
    return data?.publicUrl ?? ''
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Imagens ({images.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploader((v) => !v)}
        >
          {showUploader ? (
            <><ChevronUp className="h-3.5 w-3.5 mr-1.5" /> Ocultar upload</>
          ) : (
            <><ImageIcon className="h-3.5 w-3.5 mr-1.5" /> Adicionar imagens</>
          )}
        </Button>
      </div>

      {showUploader && (
        <div className="mb-6">
          <ImageUploader
            inspectionId={inspectionId}
            onUploaded={() => { reload(); setShowUploader(false) }}
          />
        </div>
      )}

      {images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Nenhuma imagem ainda"
          description="Faça upload das imagens de drone e fotos de campo desta vistoria."
          action={
            !showUploader
              ? <Button onClick={() => setShowUploader(true)}>Adicionar imagens</Button>
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              publicUrl={getPublicUrl(image.storage_path)}
              inspectionId={inspectionId}
              analysisSummary={analysisSummaries[image.id] ?? null}
              onDeleted={reload}
              onUpdated={reload}
            />
          ))}
        </div>
      )}
    </div>
  )
}
