/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { generateReportPdf } from '@/lib/pdf/generate-report-pdf'

export const runtime = 'nodejs'
export const maxDuration = 60

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: report, error: reportError } = await (supabase as any)
      .from('reports')
      .select('id, status')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    if (report.status !== 'approved' && report.status !== 'published') {
      return NextResponse.json(
        { error: 'Relatório precisa estar aprovado para exportar em PDF' },
        { status: 400 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
    const printUrl = `${siteUrl}/reports/${id}/print`

    const cookieStore = await cookies()
    const sessionCookies = cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))

    const pdfBuffer = await generateReportPdf(printUrl, sessionCookies)

    const path = `${id}.pdf`
    const { error: uploadError } = await (supabase as any).storage
      .from('report-pdfs')
      .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      console.error('Erro ao enviar PDF para storage:', uploadError)
      return NextResponse.json({ error: 'Erro ao salvar PDF' }, { status: 500 })
    }

    await (supabase as any).from('reports').update({ pdf_path: path }).eq('id', id)

    const { data: signedUrlData, error: signedUrlError } = await (supabase as any).storage
      .from('report-pdfs')
      .createSignedUrl(path, 60 * 60)

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: 'PDF salvo, mas falha ao gerar link de download' }, { status: 500 })
    }

    return NextResponse.json({ path, url: signedUrlData.signedUrl })
  } catch (err) {
    console.error('Erro ao gerar PDF do relatório:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno ao gerar PDF' },
      { status: 500 }
    )
  }
}
