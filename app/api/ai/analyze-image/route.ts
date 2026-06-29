/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageWithOpenAI } from '@/lib/ai/openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json() as {
      imageId: string
      inspectionId: string
      imageUrl: string
      imageType: string | null
      fieldObservations: string | null
    }

    const { imageId, inspectionId, imageUrl, imageType, fieldObservations } = body

    if (!imageId || !inspectionId || !imageUrl) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const result = await analyzeImageWithOpenAI(imageUrl, imageType, fieldObservations)

    const { data: analysis, error: dbError } = await (supabase as any)
      .from('ai_analyses')
      .insert({
        image_id: imageId,
        inspection_id: inspectionId,
        visible_elements: result.visibleElements,
        attention_points: result.attentionPoints,
        limitations: result.analysisLimitations,
        suggested_text: result.suggestedReportText,
        raw_response: result,
        status: 'draft',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erro ao salvar análise:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar análise no banco' }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('Erro na análise de IA:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
