'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Tag, MessageSquare, Crosshair, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { deleteImage, updateImageMeta } from '@/lib/inspection-images/actions'
import type { InspectionImage } from '@/types'

import { ALL_IMAGE_TYPE_LABELS, RGB_TYPES, SPECTRAL_TYPES } from './image-type-selector'

const IMAGE_TYPE_LABELS = ALL_IMAGE_TYPE_LABELS
const IMAGE_TYPES = [...RGB_TYPES, ...SPECTRAL_TYPES].map(({ value, label }) => ({ value, label }))
const SPECTRAL_VALUES = new Set(SPECTRAL_TYPES.map((t) => t.value))

const ANALYSIS_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:          { label: 'IA: Rascunho',  className: 'bg-muted text-muted-foreground border' },
  review_pending: { label: 'IA: Pendente',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:       { label: 'IA: Aprovado',  className: 'bg-green-50 text-green-700 border-green-200' },
  rejected:       { label: 'IA: Rejeitado', className: 'bg-red-50 text-red-700 border-red-200' },
}

interface ImageCardProps {
  image: InspectionImage
  publicUrl: string
  inspectionId: string
  analysisStatus: string | null
  onDeleted: () => void
  onUpdated: () => void
}

export function ImageCard({ image, publicUrl, inspectionId, analysisStatus, onDeleted, onUpdated }: ImageCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [imageType, setImageType] = useState(image.image_type ?? '')
  const [saving, setSaving] = useState(false)

  async function handleDelete() {
    if (!confirm('Excluir esta imagem?')) return
    const result = await deleteImage(image.id, image.storage_path)
    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`)
    } else {
      onDeleted()
    }
  }

  async function handleSave(formData: FormData) {
    setSaving(true)
    formData.set('image_type', imageType)
    const result = await updateImageMeta(image.id, formData)
    if (result.error) {
      alert(`Erro ao salvar: ${result.error}`)
    } else {
      setEditing(false)
      onUpdated()
    }
    setSaving(false)
  }

  return (
    <div className="group rounded-lg border bg-card overflow-hidden">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicUrl}
          alt={image.original_name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            title="Ver detalhes e análise IA"
            onClick={() => router.push(`/inspections/${inspectionId}/images/${image.id}`)}
          >
            <Sparkles className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            title="Anotar imagem"
            onClick={() => router.push(`/inspections/${inspectionId}/images/${image.id}/editor`)}
          >
            <Crosshair className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditing(!editing)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {image.image_type && (
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="secondary"
              className={`text-[10px] ${SPECTRAL_VALUES.has(image.image_type) ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {IMAGE_TYPE_LABELS[image.image_type] ?? image.image_type}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-xs text-muted-foreground mb-1">{image.original_name}</p>
        {analysisStatus && (() => {
          const cfg = ANALYSIS_STATUS_CONFIG[analysisStatus]
          return cfg ? (
            <button
              className={`mb-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80 ${cfg.className}`}
              onClick={() => router.push(`/inspections/${inspectionId}/images/${image.id}`)}
            >
              {cfg.label}
            </button>
          ) : null
        })()}

        {editing ? (
          <form action={handleSave} className="space-y-2">
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Tipo de imagem</option>
              <optgroup label="Imagem RGB">
                {RGB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
              <optgroup label="Índice Vegetal (multiespectral)">
                {SPECTRAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
                ))}
              </optgroup>
            </select>
            <Textarea
              name="field_observations"
              placeholder="Observações de campo..."
              rows={2}
              className="text-xs resize-none"
              defaultValue={image.field_observations ?? ''}
            />
            <div className="flex gap-1.5">
              <Button type="submit" size="sm" className="h-7 text-xs flex-1" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <>
            {image.field_observations && (
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{image.field_observations}</span>
              </p>
            )}
            {!image.image_type && !image.field_observations && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Tag className="h-3 w-3" /> Adicionar tipo e observações
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
