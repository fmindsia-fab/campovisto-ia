'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'

export interface AnnotationInput {
  id?: string
  image_id?: string
  marker_number: number
  x_percent: number
  y_percent: number
  category: string
  description: string | null
  priority: string
  confidence: string
}

export async function saveAnnotations(imageId: string, annotations: AnnotationInput[]) {
  const supabase = await createClient()

  // remove todas as anotações atuais e reinsere (upsert simples)
  await (supabase as any).from('image_annotations').delete().eq('image_id', imageId)

  if (annotations.length === 0) return { success: true }

  const rows = annotations.map((a) => ({
    image_id: imageId,
    marker_number: a.marker_number,
    x_percent: a.x_percent,
    y_percent: a.y_percent,
    category: a.category,
    description: a.description || null,
    priority: a.priority,
    confidence: a.confidence,
  }))

  const { error } = await (supabase as any).from('image_annotations').insert(rows)
  if (error) return { error: error.message }
  return { success: true }
}

export async function getAnnotations(imageId: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('image_annotations')
    .select('*')
    .eq('image_id', imageId)
    .order('marker_number', { ascending: true })

  if (error) return []
  return data
}

export async function saveAnnotatedImagePath(imageId: string, storagePath: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('inspection_images')
    .update({ annotated_path: storagePath })
    .eq('id', imageId)

  if (error) return { error: error.message }
  return { success: true }
}
