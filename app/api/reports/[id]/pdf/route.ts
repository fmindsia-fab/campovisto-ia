/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { generateReportPdf } from '@/lib/pdf/generate-report-pdf'
import { checkCanExportPdf } from '@/lib/plans/check-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

interface Props {
  params: Promise<{ id: string }>
}

const DIACRITICS_REGEX = new RegExp('[̀-ͯ]', 'g')

function slugifyFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildDownloadFilename(propertyName: string | null, visitDate: string | null): string {
  const namePart = slugifyFilename(propertyName || 'relatorio') || 'relatorio'
  const datePart = visitDate
    ? slugifyFilename(new Date(`${visitDate}T00:00:00`).toLocaleDateString('pt-BR'))
    : ''
  return `${[namePart, datePart].filter(Boolean).join('-')}.pdf`
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const limitCheck = await checkCanExportPdf(user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.reason, code: limitCheck.code }, { status: 403 })
    }

    const { data: report, error: reportError } = await (supabase as any)
      .from('reports')
      .select('id, status, title, inspections(visit_date, properties(name))')
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

    const downloadFilename = buildDownloadFilename(
      report.inspections?.properties?.name ?? report.title ?? null,
      report.inspections?.visit_date ?? null
    )

    const { data: signedUrlData, error: signedUrlError } = await (supabase as any).storage
      .from('report-pdfs')
      .createSignedUrl(path, 60 * 60, { download: downloadFilename })

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
