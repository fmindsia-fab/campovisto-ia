'use client'

import Image from 'next/image'
import type { ReportWithRelations } from '@/lib/reports/actions'

const CATEGORY_LABELS: Record<string, string> = {
  bovine: 'Bovino',
  pasture: 'Pastagem',
  bare_soil: 'Solo exposto',
  cattle_trail: 'Trilha de gado',
  wetland: 'Área úmida',
  fence: 'Cerca',
  waterer: 'Bebedouro',
  shade: 'Sombra',
  crop: 'Lavoura',
  structure: 'Estrutura',
  attention_point: 'Ponto de atenção',
  pasture_degradation: 'Degradação de pastagem',
  water_stress: 'Estresse hídrico',
  low_biomass: 'Baixa biomassa',
  nutrient_deficiency: 'Deficiência nutricional',
  healthy_vegetation: 'Vegetação saudável',
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

const PRIORITY_CLASSES: Record<string, string> = {
  high: 'text-red-600 font-semibold',
  medium: 'text-amber-600 font-semibold',
  low: 'text-green-600 font-semibold',
}

interface AnnotationData {
  id: string
  image_id: string
  marker_number: number
  category: string
  description: string | null
  priority: string
  confidence: string
}

interface AnalysisData {
  id: string
  image_id: string
  visible_elements: string[]
  attention_points: { category: string; description: string; priority: string; confidence: string }[]
  limitations: string[]
  suggested_text: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
}

interface ImageData {
  id: string
  original_name: string
  image_type: string | null
  field_observations: string | null
  storage_path: string
}

interface Props {
  report: ReportWithRelations
  images: ImageData[]
  annotations: AnnotationData[]
  analysisMap: Record<string, AnalysisData>
  publicUrlMap: Record<string, string>
}

export function ReportPreview({ report, images, annotations, analysisMap, publicUrlMap }: Props) {
  const inspection = report.inspections
  const property = inspection?.properties
  const client = property?.clients

  const visitDate = inspection?.visit_date
    ? new Date(inspection.visit_date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '—'

  const generatedDate = new Date(report.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  // coleta todos os pontos de atenção de todas as análises aprovadas
  const allAttentionPoints = images.flatMap((img) => {
    const analysis = analysisMap[img.id]
    if (!analysis) return []
    return (analysis.attention_points ?? []).map((ap) => ({ ...ap, imageName: img.original_name }))
  })

  const allLimitations = Array.from(
    new Set(images.flatMap((img) => analysisMap[img.id]?.limitations ?? []))
  )

  const allAnnotations = annotations.filter((a) => a.description)

  return (
    <div className="report-body bg-white text-gray-900 font-sans">

      {/* ── CAPA ── */}
      <section className="report-cover min-h-[60vh] flex flex-col justify-between border-b-4 border-green-600 pb-10 mb-10 print:min-h-screen print:pb-0 print:mb-0 print:border-b-0">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700">CampoVisto.IA</p>
            <p className="text-xs text-gray-400">by FMinds</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Relatório gerado em {generatedDate}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2">Relatório de Vistoria</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{property?.name ?? '—'}</h1>
          <p className="text-xl text-gray-500">{client?.name ?? '—'}</p>
          <p className="mt-4 text-sm text-gray-500">Data da visita: {visitDate}</p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
          <p>Análise preliminar assistida por IA · Revisada por humano · Não constitui laudo técnico</p>
        </div>
      </section>

      {/* ── DADOS DA PROPRIEDADE ── */}
      <section className="report-section mb-10 print:mb-8">
        <h2 className="report-section-title">1. Dados da Propriedade e Cliente</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Propriedade</p>
            <p className="font-medium">{property?.name ?? '—'}</p>
            {property?.location && <p className="text-gray-500">{property.location}</p>}
            {property?.activity_type && <p className="text-gray-500">Atividade: {property.activity_type}</p>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Cliente / Produtor</p>
            <p className="font-medium">{client?.name ?? '—'}</p>
            {client?.city && <p className="text-gray-500">{client.city}</p>}
            {client?.phone && <p className="text-gray-500">{client.phone}</p>}
            {client?.email && <p className="text-gray-500">{client.email}</p>}
          </div>
        </div>
      </section>

      {/* ── OBJETIVO ── */}
      {inspection?.objective && (
        <section className="report-section mb-10 print:mb-8">
          <h2 className="report-section-title">2. Objetivo da Vistoria</h2>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{inspection.objective}</p>
        </section>
      )}

      {/* ── IMAGENS ANOTADAS ── */}
      <section className="report-section mb-10 print:mb-8">
        <h2 className="report-section-title">{inspection?.objective ? '3' : '2'}. Imagens Anotadas</h2>

        <div className="mt-4 space-y-10">
          {images.map((image, idx) => {
            const imgAnnotations = annotations.filter((a) => a.image_id === image.id)
            const analysis = analysisMap[image.id]
            const publicUrl = publicUrlMap[image.id] ?? ''

            return (
              <div key={image.id} className="print:break-inside-avoid">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Imagem {idx + 1} — {image.original_name}
                  {image.image_type && ` (${image.image_type.toUpperCase()})`}
                </p>

                {publicUrl && (
                  <div className="relative w-full aspect-video bg-gray-100 rounded overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicUrl}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {image.field_observations && (
                  <p className="text-xs text-gray-500 mb-2 italic">Observações de campo: {image.field_observations}</p>
                )}

                {analysis?.suggested_text && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{analysis.suggested_text}</p>
                )}

                {imgAnnotations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Marcadores ({imgAnnotations.length})</p>
                    <div className="grid grid-cols-1 gap-1">
                      {imgAnnotations.map((ann) => (
                        <div key={ann.id} className="flex items-start gap-2 text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0">
                          <span className="shrink-0 font-bold text-gray-900 w-5">{ann.marker_number}.</span>
                          <span className="shrink-0 text-gray-400">{CATEGORY_LABELS[ann.category] ?? ann.category}</span>
                          {ann.description && <span>— {ann.description}</span>}
                          <span className={`ml-auto shrink-0 ${PRIORITY_CLASSES[ann.priority] ?? ''}`}>
                            {PRIORITY_LABELS[ann.priority] ?? ann.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── PONTOS DE ATENÇÃO ── */}
      {allAttentionPoints.length > 0 && (
        <section className="report-section mb-10 print:mb-8 print:break-before-page">
          <h2 className="report-section-title">Pontos de Atenção Consolidados</h2>
          <div className="mt-4 space-y-2">
            {allAttentionPoints
              .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 }
                return (order[a.priority as keyof typeof order] ?? 3) - (order[b.priority as keyof typeof order] ?? 3)
              })
              .map((ap, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                  <span className={`shrink-0 font-semibold text-xs mt-0.5 ${PRIORITY_CLASSES[ap.priority] ?? ''}`}>
                    {PRIORITY_LABELS[ap.priority] ?? ap.priority}
                  </span>
                  <div>
                    <span className="text-gray-400 text-xs">{CATEGORY_LABELS[ap.category] ?? ap.category}</span>
                    <p className="text-gray-800">{ap.description}</p>
                    <p className="text-xs text-gray-400">{ap.imageName}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── ANOTAÇÕES DESCRITAS ── */}
      {allAnnotations.length > 0 && (
        <section className="report-section mb-10 print:mb-8">
          <h2 className="report-section-title">Observações de Campo com Marcadores</h2>
          <div className="mt-4 space-y-2">
            {allAnnotations.map((ann) => (
              <div key={ann.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                <span className="shrink-0 font-bold text-gray-900 w-6">{ann.marker_number}.</span>
                <div>
                  <span className="text-xs text-gray-400">{CATEGORY_LABELS[ann.category] ?? ann.category}</span>
                  <p className="text-gray-800">{ann.description}</p>
                </div>
                <span className={`ml-auto shrink-0 text-xs ${PRIORITY_CLASSES[ann.priority] ?? ''}`}>
                  {PRIORITY_LABELS[ann.priority] ?? ann.priority}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LIMITAÇÕES ── */}
      {allLimitations.length > 0 && (
        <section className="report-section mb-10 print:mb-8">
          <h2 className="report-section-title">Limitações da Análise</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
            {allLimitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 text-gray-300 mt-1">•</span>
                {lim}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── OBSERVAÇÕES GERAIS ── */}
      {inspection?.general_observations && (
        <section className="report-section mb-10 print:mb-8">
          <h2 className="report-section-title">Observações Gerais do Campo</h2>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{inspection.general_observations}</p>
        </section>
      )}

      {/* ── DISCLAIMER ── */}
      <section className="report-section mt-12 pt-6 border-t border-gray-200 print:mt-8">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Aviso importante:</strong> Este relatório é resultado de uma análise preliminar assistida por inteligência artificial,
          revisada por um profissional humano. Não constitui laudo técnico agronômico, veterinário ou ambiental.
          As informações aqui contidas têm caráter orientativo e devem ser validadas por profissional habilitado antes de qualquer
          tomada de decisão. CampoVisto.IA by FMinds · {generatedDate}
        </p>
      </section>

    </div>
  )
}
