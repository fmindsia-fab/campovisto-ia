'use client'

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
  reviewerName?: string | null
}

// Deriva pontos fortes e fracos das análises aprovadas
function deriveInsights(images: ImageData[], analysisMap: Record<string, AnalysisData>, annotations: AnnotationData[]) {
  const strengths: string[] = []
  const weaknesses: string[] = []

  for (const img of images) {
    const analysis = analysisMap[img.id]
    if (!analysis) continue

    // pontos fortes = categorias positivas nos elementos visíveis
    const positiveKeywords = ['saudável', 'boa cobertura', 'adequado', 'bem manejado', 'uniforme', 'boa condição', 'ativo', 'limpo', 'conservado']
    for (const el of (analysis.visible_elements ?? [])) {
      if (positiveKeywords.some((kw) => el.toLowerCase().includes(kw))) {
        if (!strengths.includes(el)) strengths.push(el)
      }
    }

    // pontos positivos = atenção de prioridade baixa com categoria de vegetação saudável
    for (const ap of (analysis.attention_points ?? [])) {
      if (ap.priority === 'low' && ['healthy_vegetation', 'pasture', 'waterer', 'shade'].includes(ap.category)) {
        if (!strengths.includes(ap.description)) strengths.push(ap.description)
      }
    }

    // pontos fracos = atenção de prioridade alta/média
    for (const ap of (analysis.attention_points ?? [])) {
      if (ap.priority === 'high' || ap.priority === 'medium') {
        const label = `${CATEGORY_LABELS[ap.category] ?? ap.category}: ${ap.description}`
        if (!weaknesses.includes(label)) weaknesses.push(label)
      }
    }
  }

  // complementa pontos fracos com anotações de prioridade alta que têm descrição
  for (const ann of annotations) {
    if (ann.priority === 'high' && ann.description) {
      const label = `${CATEGORY_LABELS[ann.category] ?? ann.category}: ${ann.description}`
      if (!weaknesses.includes(label)) weaknesses.push(label)
    }
  }

  return { strengths, weaknesses }
}

export function ReportPreview({ report, images, annotations, analysisMap, publicUrlMap, reviewerName }: Props) {
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

  const allLimitations = Array.from(
    new Set(images.flatMap((img) => analysisMap[img.id]?.limitations ?? []))
  )

  const { strengths, weaknesses } = deriveInsights(images, analysisMap, annotations)

  const highAnnotations = annotations.filter((a) => a.priority === 'high' && a.description)
  const totalAnnotations = annotations.length
  const imagesWithAnalysis = images.filter((img) => analysisMap[img.id]).length

  return (
    <div className="report-body bg-white text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ════ CAPA ════ */}
      <div style={{
        pageBreakAfter: 'always',
        height: '297mm',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'white',
      }}>
        {/* Barra verde lateral esquerda */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '6px', background: '#16a34a',
        }} />

        {/* Área de conteúdo com padding */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 48px 40px 56px' }}>

          {/* Logo topo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0' }}>
            <div style={{
              width: '32px', height: '32px', background: '#16a34a', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '800', fontFamily: 'sans-serif' }}>CV</span>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'sans-serif', color: '#111827', margin: 0, lineHeight: 1 }}>CampoVisto.IA</p>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'sans-serif', margin: 0 }}>by FMinds</p>
            </div>
          </div>

          {/* Bloco principal — posicionado no terço superior */}
          <div style={{ marginTop: '64px' }}>
            <p style={{
              fontSize: '10px', fontWeight: '700', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#16a34a', fontFamily: 'sans-serif',
              marginBottom: '16px',
            }}>
              Relatório de Vistoria Aérea
            </p>

            <h1 style={{
              fontSize: '52px', fontWeight: '800', color: '#0f172a',
              lineHeight: '1.05', margin: '0 0 20px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              {property?.name ?? '—'}
            </h1>

            {/* Linha divisória */}
            <div style={{ width: '48px', height: '3px', background: '#16a34a', marginBottom: '24px' }} />

            {/* Cliente e data lado a lado */}
            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', fontFamily: 'sans-serif', marginBottom: '4px' }}>Cliente / Produtor</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{client?.name ?? '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', fontFamily: 'sans-serif', marginBottom: '4px' }}>Data da visita</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{visitDate}</p>
              </div>
              {reviewerName && (
                <div>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', fontFamily: 'sans-serif', marginBottom: '4px' }}>Revisado por</p>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', fontFamily: 'sans-serif', margin: 0 }}>{reviewerName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Espaço flexível */}
          <div style={{ flex: 1 }} />

          {/* Rodapé da capa */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <p style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'sans-serif', margin: 0, maxWidth: '60%', lineHeight: '1.5' }}>
              Análise preliminar assistida por IA · Revisada por profissional humano<br />
              Não constitui laudo técnico agronômico, veterinário ou ambiental
            </p>
            <p style={{ fontSize: '10px', color: '#d1d5db', fontFamily: 'sans-serif', margin: 0 }}>
              Gerado em {generatedDate}
            </p>
          </div>
        </div>
      </div>

      {/* ════ CORPO DO RELATÓRIO ════ */}
      <div style={{ padding: '40px 48px 48px 56px' }}>

      {/* ════ DADOS DA PROPRIEDADE ════ */}
      <ReportSection number="1" title="Dados da Propriedade e Cliente">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <InfoBlock label="Propriedade">
            <p style={{ fontWeight: '600' }}>{property?.name ?? '—'}</p>
            {property?.location && <p style={{ color: '#6b7280' }}>{property.location}</p>}
            {property?.activity_type && <p style={{ color: '#6b7280' }}>Atividade: {property.activity_type}</p>}
          </InfoBlock>
          <InfoBlock label="Cliente / Produtor">
            <p style={{ fontWeight: '600' }}>{client?.name ?? '—'}</p>
            {client?.city && <p style={{ color: '#6b7280' }}>{client.city}</p>}
            {client?.phone && <p style={{ color: '#6b7280' }}>{client.phone}</p>}
            {client?.email && <p style={{ color: '#6b7280' }}>{client.email}</p>}
          </InfoBlock>
        </div>
      </ReportSection>

      {/* ════ OBJETIVO ════ */}
      {inspection?.objective && (
        <ReportSection number="2" title="Objetivo da Vistoria">
          <p style={{ color: '#374151', lineHeight: '1.7' }}>{inspection.objective}</p>
        </ReportSection>
      )}

      {/* ════ PANORAMA GERAL — PONTOS FORTES E FRACOS ════ */}
      <ReportSection number={inspection?.objective ? '3' : '2'} title="Panorama Geral da Propriedade">
        <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '20px', fontFamily: 'sans-serif' }}>
          Síntese extraída das análises de IA revisadas por humano, consolidando os principais aspectos identificados nas imagens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Pontos Fortes */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>✓</span>
              <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d', fontFamily: 'sans-serif' }}>Pontos Positivos</p>
            </div>
            {strengths.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {strengths.slice(0, 8).map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid #d1fae5', marginBottom: '6px', fontSize: '12px', color: '#166534', fontFamily: 'sans-serif' }}>
                    <span style={{ color: '#16a34a', flexShrink: 0 }}>•</span>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                Nenhum ponto positivo identificado explicitamente nas análises.
              </p>
            )}
          </div>

          {/* Pontos Fracos */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>⚠</span>
              <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c2410c', fontFamily: 'sans-serif' }}>Pontos de Atenção</p>
            </div>
            {weaknesses.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {weaknesses.slice(0, 8).map((w, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid #fed7aa', marginBottom: '6px', fontSize: '12px', color: '#9a3412', fontFamily: 'sans-serif' }}>
                    <span style={{ color: '#ea580c', flexShrink: 0 }}>•</span>
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                Nenhum ponto crítico identificado nas análises.
              </p>
            )}
          </div>
        </div>
      </ReportSection>

      {/* ════ IMAGENS ANOTADAS ════ */}
      <ReportSection number={inspection?.objective ? '4' : '3'} title="Imagens e Análises por Drone">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {images.map((image, idx) => {
            const imgAnnotations = annotations.filter((a) => a.image_id === image.id)
            const analysis = analysisMap[image.id]
            const publicUrl = publicUrlMap[image.id] ?? ''
            const highCount = imgAnnotations.filter((a) => a.priority === 'high').length
            const mediumCount = imgAnnotations.filter((a) => a.priority === 'medium').length

            return (
              <div key={image.id} style={{ pageBreakInside: 'avoid' }}>
                {/* Cabeçalho da imagem */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                  <div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', fontFamily: 'sans-serif' }}>
                      Imagem {idx + 1}{image.image_type ? ` · ${image.image_type.toUpperCase()}` : ''}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: 'sans-serif' }}>{image.original_name}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontFamily: 'sans-serif' }}>
                    {highCount > 0 && (
                      <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
                        {highCount} alta prioridade
                      </span>
                    )}
                    {mediumCount > 0 && (
                      <span style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
                        {mediumCount} média prioridade
                      </span>
                    )}
                    {imgAnnotations.length === 0 && (
                      <span style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: '10px', padding: '2px 8px', borderRadius: '99px' }}>
                        Sem marcadores
                      </span>
                    )}
                  </div>
                </div>

                {/* Imagem */}
                {publicUrl && (
                  <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '6px', marginBottom: '12px', background: '#f3f4f6' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={publicUrl} alt={image.original_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Análise textual */}
                {analysis?.suggested_text && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', fontWeight: '700', fontFamily: 'sans-serif', marginBottom: '6px' }}>
                      Análise IA (revisada)
                    </p>
                    <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>{analysis.suggested_text}</p>
                  </div>
                )}

                {/* Observações de campo */}
                {image.field_observations && (
                  <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginBottom: '10px', fontFamily: 'sans-serif' }}>
                    Observações de campo: {image.field_observations}
                  </p>
                )}

                {/* Marcadores */}
                {imgAnnotations.length > 0 && (() => {
                  // agrupa por categoria para resumo
                  const byCategory: Record<string, { count: number; withDesc: AnnotationData[] }> = {}
                  for (const ann of imgAnnotations) {
                    if (!byCategory[ann.category]) byCategory[ann.category] = { count: 0, withDesc: [] }
                    byCategory[ann.category].count++
                    if (ann.description) byCategory[ann.category].withDesc.push(ann)
                  }

                  const annotatedOnes = imgAnnotations.filter((a) => a.description)
                  const analysis = analysisMap[image.id]
                  const reviewer = analysis?.reviewer_notes !== undefined ? reviewerName : null

                  return (
                    <div>
                      {/* Resumo compacto por categoria */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: annotatedOnes.length > 0 ? '14px' : 0 }}>
                        {Object.entries(byCategory).map(([cat, { count }]) => (
                          <div key={cat} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 14px', fontFamily: 'sans-serif' }}>
                            <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: 1 }}>{count}</p>
                            <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {CATEGORY_LABELS[cat] ?? cat}{count > 1 && cat === 'bovine' ? 's' : ''}
                            </p>
                          </div>
                        ))}
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 14px', fontFamily: 'sans-serif' }}>
                          <p style={{ fontSize: '10px', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
                            Marcado manualmente<br />
                            {reviewer ? `Revisado por ${reviewer}` : 'Revisado por humano'}
                          </p>
                        </div>
                      </div>

                      {/* Apenas marcadores COM descrição na tabela */}
                      {annotatedOnes.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'sans-serif' }}>
                          <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                              <th style={{ padding: '6px 8px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '10px' }}>#</th>
                              <th style={{ padding: '6px 8px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '10px' }}>Categoria</th>
                              <th style={{ padding: '6px 8px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '10px' }}>Observação</th>
                              <th style={{ padding: '6px 8px', textAlign: 'right', color: '#6b7280', fontWeight: '600', fontSize: '10px' }}>Prioridade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {annotatedOnes.map((ann, i) => (
                              <tr key={ann.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '6px 8px', fontWeight: '700', color: '#374151' }}>{ann.marker_number}</td>
                                <td style={{ padding: '6px 8px', color: '#374151' }}>{CATEGORY_LABELS[ann.category] ?? ann.category}</td>
                                <td style={{ padding: '6px 8px', color: '#6b7280' }}>{ann.description}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                  <span style={{
                                    fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px',
                                    ...(ann.priority === 'high' ? { background: '#fef2f2', color: '#dc2626' } :
                                        ann.priority === 'medium' ? { background: '#fffbeb', color: '#d97706' } :
                                        { background: '#f0fdf4', color: '#16a34a' })
                                  }}>
                                    {PRIORITY_LABELS[ann.priority] ?? ann.priority}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      </ReportSection>

      {/* ════ LIMITAÇÕES ════ */}
      {allLimitations.length > 0 && (
        <ReportSection number="—" title="Limitações da Análise">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allLimitations.map((lim, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6', marginBottom: '8px', fontSize: '13px', color: '#6b7280', fontFamily: 'sans-serif' }}>
                <span style={{ color: '#d1d5db', flexShrink: 0, marginTop: '2px' }}>•</span>
                {lim}
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {/* ════ OBSERVAÇÕES GERAIS ════ */}
      {inspection?.general_observations && (
        <ReportSection number="—" title="Observações Gerais do Campo">
          <p style={{ color: '#374151', lineHeight: '1.7', fontFamily: 'sans-serif', fontSize: '13px' }}>{inspection.general_observations}</p>
        </ReportSection>
      )}

      {/* ════ DISCLAIMER ════ */}
      <div style={{ marginTop: '48px', padding: '16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '10px', color: '#9ca3af', lineHeight: '1.6' }}>
          <strong style={{ color: '#6b7280' }}>Aviso importante:</strong>{' '}
          Este relatório é resultado de uma análise preliminar assistida por inteligência artificial, revisada por um profissional humano.
          Não constitui laudo técnico agronômico, veterinário ou ambiental. As informações aqui contidas têm caráter orientativo e devem ser
          validadas por profissional habilitado antes de qualquer tomada de decisão.
          CampoVisto.IA by FMinds · Gerado em {generatedDate}
        </p>
      </div>

      </div>{/* fim do corpo */}
    </div>
  )
}

// ── Componentes auxiliares ──

function ReportSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #f3f4f6' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: '20px' }}>
          {number !== '—' ? number : ''}
        </span>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: 'sans-serif', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ fontSize: '13px' }}>{children}</div>
    </div>
  )
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', fontFamily: 'sans-serif', marginBottom: '6px' }}>{label}</p>
      <div style={{ fontSize: '13px', color: '#374151', fontFamily: 'sans-serif', lineHeight: '1.6' }}>{children}</div>
    </div>
  )
}
