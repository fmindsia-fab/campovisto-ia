'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'

export async function saveImageRecord(data: {
  inspectionId: string
  storagePath: string
  originalName: string
  imageType?: string
  orderIndex: number
}) {
  const supabase = await createClient()

  const { data: record, error } = await (supabase as any)
    .from('inspection_images')
    .insert({
      inspection_id: data.inspectionId,
      storage_path: data.storagePath,
      original_name: data.originalName,
      image_type: data.imageType || null,
      order_index: data.orderIndex,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, data: record }
}

export async function updateImageMeta(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('inspection_images')
    .update({
      image_type: formData.get('image_type') || null,
      field_observations: formData.get('field_observations') || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteImage(id: string, storagePath: string) {
  const supabase = await createClient()

  const bucket = storagePath.startsWith('field-photos/') ? 'field-photos' : 'drone-images'
  const path = storagePath.replace(/^(drone-images|field-photos)\//, '')

  await (supabase as any).storage.from(bucket).remove([path])

  const { error } = await (supabase as any)
    .from('inspection_images')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getInspectionImages(inspectionId: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('inspection_images')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('order_index', { ascending: true })

  if (error) return []
  return data
}

export async function getImagePublicUrl(storagePath: string) {
  const supabase = await createClient()

  const bucket = storagePath.startsWith('field-photos/') ? 'field-photos' : 'drone-images'
  const path = storagePath.replace(/^(drone-images|field-photos)\//, '')

  const { data } = (supabase as any).storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl ?? null
}
