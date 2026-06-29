'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, AlertTriangle, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { approveAnalysis, rejectAnalysis, updateSuggestedText } from '@/lib/ai-analyses/actions'

interface AttentionPoint {
  category: string
  description: string
  priority: 'high' | 'medium' | 'low'
  confidence: 'confirmed' | 'probable' | 'uncertain'
}

interface Analysis {
  id: string
  status: string
  visible_elements: string[]
  attention_points: AttentionPoint[]
  limitations: string[]
  suggested_text: string | null
  reviewed_at: string | null
  reviewer_notes: string | null
}

const STATUS_CONFIG = {
  draft: { label: 'Rascunho IA', color: 'secondary' as const, icon: FileText },
  review_pending: { label: 'Revisão Pendente', color: 'default' as const, icon: AlertTriangle },
  approved: { label: 'Aprovado', color: 'default' as const, icon: CheckCircle2 },
  rejected: { label: 'Rejeitado', color: 'destructive' as const, icon: XCircle },
}

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-green-600 bg-green-50 border-green-200',
}

const PRIORITY_LABELS = { high: 'Alta', medium: 'Média', low: 'Baixa' }
const CONFIDENCE_LABELS = { confirmed: 'Confirmado', probable: 'Provável', uncertain: 'Incerto' }
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
}

interface Props {
  analysis: Analysis
}

export function AnalysisResult({ analysis }: Props) {
  const router = useRouter()
  const [reviewerNotes, setReviewerNotes] = useState('')
  const [suggestedText, setSuggestedText] = useState(analysis.suggested_text ?? '')
  const [editingText, setEditingText] = useState(false)
  const [showElements, setShowElements] = useState(false)
  const [saving, setSaving] = useState(false)

  const statusConfig = STATUS_CONFIG[analysis.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
  const StatusIcon = statusConfig.icon
  const isApproved = analysis.status === 'approved'
  const isRejected = analysis.status === 'rejected'
  const isLocked = isApproved || isRejected

  async function handleApprove() {
    setSaving(true)
    if (editingText) {
      await updateSuggestedText(analysis.id, suggestedText)
    }
    const result = await approveAnalysis(analysis.id, reviewerNotes || undefined)
    if (result.error) {
      alert(`Erro: ${result.error}`)
    } else {
      router.refresh()
    }
    setSaving(false)
  }

  async function handleReject() {
    if (!reviewerNotes.trim()) {
      alert('Informe o motivo da rejeição.')
      return
    }
    setSaving(true)
    const result = await rejectAnalysis(analysis.id, reviewerNotes)
    if (result.error) {
      alert(`Erro: ${result.error}`)
    } else {
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        <Badge variant={statusConfig.color} className="gap-1.5">
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
        {analysis.reviewed_at && (
          <span className="text-xs text-muted-foreground">
            {new Date(analysis.reviewed_at).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      {/* Pontos de atenção */}
      {analysis.attention_points.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Pontos de Atenção ({analysis.attention_points.length})
          </p>
          <div className="space-y-2">
            {(analysis.attention_points as AttentionPoint[]).map((pt, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-xs ${PRIORITY_COLORS[pt.priority]}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold">{CATEGORY_LABELS[pt.category] ?? pt.category}</span>
                  <div className="flex gap-1">
                    <span className="opacity-75">{PRIORITY_LABELS[pt.priority]}</span>
                    <span className="opacity-50">·</span>
                    <span className="opacity-75">{CONFIDENCE_LABELS[pt.confidence]}</span>
                  </div>
                </div>
                <p className="leading-relaxed opacity-90">{pt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elementos visíveis (colapsável) */}
      {analysis.visible_elements.length > 0 && (
        <div>
          <button
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
            onClick={() => setShowElements((v) => !v)}
          >
            <Eye className="h-3 w-3" />
            Elementos Visíveis ({analysis.visible_elements.length})
            {showElements ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showElements && (
            <ul className="mt-2 space-y-1">
              {(analysis.visible_elements as string[]).map((el, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary">·</span>
                  {el}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Texto sugerido */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Texto Sugerido para Relatório
          </p>
          {!isLocked && (
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => setEditingText((v) => !v)}
            >
              {editingText ? 'Cancelar' : 'Editar'}
            </button>
          )}
        </div>
        {editingText ? (
          <Textarea
            value={suggestedText}
            onChange={(e) => setSuggestedText(e.target.value)}
            rows={5}
            className="text-xs"
          />
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed rounded-md bg-muted/40 p-3">
            {suggestedText || '—'}
          </p>
        )}
      </div>

      {/* Limitações */}
      {analysis.limitations.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Limitações da Análise
          </p>
          <ul className="space-y-1">
            {(analysis.limitations as string[]).map((lim, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
                {lim}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nota do revisor (leitura) */}
      {isLocked && analysis.reviewer_notes && (
        <div className="rounded-md border bg-muted/40 p-3 space-y-1">
          <p className="text-xs font-semibold">Nota do revisor</p>
          <p className="text-xs text-muted-foreground">{analysis.reviewer_notes}</p>
        </div>
      )}

      {/* Painel de revisão */}
      {!isLocked && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-xs font-semibold">Revisão Humana</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Nota (obrigatória para rejeitar)</Label>
            <Textarea
              placeholder="Observações do revisor..."
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleApprove}
              disabled={saving}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-destructive hover:text-destructive"
              onClick={handleReject}
              disabled={saving}
            >
              <XCircle className="h-3.5 w-3.5" />
              Rejeitar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
