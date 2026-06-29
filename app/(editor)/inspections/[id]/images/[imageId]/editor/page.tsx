import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAnnotations } from '@/lib/annotations/actions'
import { AnnotationEditor } from './annotation-editor'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  params: Promise<{ id: string; imageId: string }>
}

export default async function EditorPage({ params }: Props) {
  const { id: inspectionId, imageId } = await params
  const supabase = await createClient()

  const { data: image } = await (supabase as any)
    .from('inspection_images')
    .select('*')
    .eq('id', imageId)
    .single()

  if (!image) notFound()

  const annotations = await getAnnotations(imageId)

  const bucket = image.storage_path.startsWith('field-photos/') ? 'field-photos' : 'drone-images'
  const path = image.storage_path.replace(/^(drone-images|field-photos)\//, '')
  const { data: urlData } = (supabase as any).storage.from(bucket).getPublicUrl(path)
  const publicUrl = urlData?.publicUrl ?? ''

  return (
    <AnnotationEditor
      inspectionId={inspectionId}
      image={image}
      publicUrl={publicUrl}
      initialAnnotations={annotations}
    />
  )
}
