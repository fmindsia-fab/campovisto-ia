'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Tag, MessageSquare, Crosshair, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deleteImage, updateImageMeta } from '@/lib/inspection-images/actions'
import type { InspectionImage } from '@/types'

const IMAGE_TYPE_LABELS: Record<string, string> = {
  overview: 'Visão geral',
  pasture: 'Pastagem',
  livestock: 'Rebanho',
  bare_soil: 'Solo exposto',
  water: 'Água',
  fence: 'Cerca',
  waterer: 'Bebedouro',
  crop: 'Lavoura',
  structure: 'Estrutura',
  wetland: 'Área úmida',
  other: 'Outro',
}

const IMAGE_TYPES = Object.entries(IMAGE_TYPE_LABELS).map(([value, label]) => ({ value, label }))

interface ImageCardProps {
  image: InspectionImage
  publicUrl: string
  inspectionId: string
  onDeleted: () => void
  onUpdated: () => void
}

export function ImageCard({ image, publicUrl, inspectionId, onDeleted, onUpdated }: ImageCardProps) {
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
            <Badge variant="secondary" className="text-[10px]">
              {IMAGE_TYPE_LABELS[image.image_type] ?? image.image_type}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-xs text-muted-foreground mb-2">{image.original_name}</p>

        {editing ? (
          <form action={handleSave} className="space-y-2">
            <Select value={imageType} onValueChange={setImageType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Tipo de imagem" />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
