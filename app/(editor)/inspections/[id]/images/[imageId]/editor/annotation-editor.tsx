'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, ZoomIn, ZoomOut, Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnnotationCanvas } from '@/components/editor/annotation-canvas'
import { MarkerPanel } from '@/components/editor/marker-panel'
import { MarkerForm } from '@/components/editor/marker-form'
import { saveAnnotations } from '@/lib/annotations/actions'
import type { ImageAnnotation, InspectionImage, MarkerData } from '@/types'

interface Props {
  inspectionId: string
  image: InspectionImage
  publicUrl: string
  initialAnnotations: ImageAnnotation[]
}

// template padrão que persiste entre marcadores
interface MarkerTemplate {
  category: string
  priority: string
  confidence: string
}

export function AnnotationEditor({ inspectionId, image, publicUrl, initialAnnotations }: Props) {
  const router = useRouter()
  const [markers, setMarkers] = useState<MarkerData[]>(initialAnnotations)
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null)
  const [addingMode, setAddingMode] = useState(false)
  const [panMode, setPanMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scale, setScale] = useState(1)

  // template persistente — mantém as configs do último marcador aplicado
  const [template, setTemplate] = useState<MarkerTemplate>({
    category: 'attention_point',
    priority: 'medium',
    confidence: 'probable',
  })

  function handleCanvasClick(xPercent: number, yPercent: number) {
    if (!addingMode) return
    setMarkers((prev) => {
      const newMarker: MarkerData = {
        marker_number: prev.length + 1,
        x_percent: xPercent,
        y_percent: yPercent,
        category: template.category,
        description: null,
        priority: template.priority,
        confidence: template.confidence,
      }
      return [...prev, newMarker]
    })
    // mantém modo de adição ativo para continuar marcando
    // não seleciona o marcador — usuário continua no fluxo de adicionar
  }

  function handleUpdateMarker(updated: MarkerData) {
    setMarkers((prev) =>
      prev.map((m) => m.marker_number === updated.marker_number ? updated : m)
    )
    // atualiza o template com as configs aplicadas
    setTemplate({
      category: updated.category,
      priority: updated.priority,
      confidence: updated.confidence,
    })
    setSelectedMarker(null)
  }

  function handleDeleteMarker(markerNumber: number) {
    const filtered = markers.filter((m) => m.marker_number !== markerNumber)
    const renumbered = filtered.map((m, i) => ({ ...m, marker_number: i + 1 }))
    setMarkers(renumbered)
    setSelectedMarker(null)
  }

  async function handleSave() {
    setSaving(true)
    const result = await saveAnnotations(image.id, markers)
    if (result.error) {
      alert(`Erro ao salvar: ${result.error}`)
    } else {
      router.push(`/inspections/${inspectionId}`)
    }
    setSaving(false)
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/inspections/${inspectionId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-sm font-medium truncate max-w-xs">{image.original_name}</p>
            <p className="text-xs text-muted-foreground">{markers.length} marcador(es)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
            title="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant={panMode ? 'default' : 'outline'}
            size="icon"
            onClick={() => { setPanMode((v) => !v); setAddingMode(false) }}
            title="Mover imagem"
          >
            <Hand className="h-4 w-4" />
          </Button>

          <Button
            variant={addingMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setAddingMode((v) => !v); setPanMode(false); setSelectedMarker(null) }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {addingMode ? 'Clique na imagem' : 'Adicionar marcador'}
          </Button>

          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className={`flex-1 bg-muted/30 flex items-center justify-center p-4 ${panMode ? 'overflow-hidden' : 'overflow-auto'}`}>
          <AnnotationCanvas
            imageUrl={publicUrl}
            markers={markers}
            selectedMarkerNumber={selectedMarker?.marker_number ?? null}
            addingMode={addingMode}
            panMode={panMode}
            scale={scale}
            onCanvasClick={handleCanvasClick}
            onMarkerClick={(m) => { setSelectedMarker(m); setAddingMode(false) }}
          />
        </div>

        {/* Painel lateral */}
        <div className="w-80 shrink-0 border-l bg-card overflow-y-auto">
          {selectedMarker ? (
            <MarkerForm
              marker={selectedMarker}
              onUpdate={handleUpdateMarker}
              onDelete={() => handleDeleteMarker(selectedMarker.marker_number)}
              onClose={() => setSelectedMarker(null)}
            />
          ) : (
            <MarkerPanel
              markers={markers}
              template={template}
              onTemplateChange={setTemplate}
              addingMode={addingMode}
              onSelectMarker={(m) => { setSelectedMarker(m); setAddingMode(false) }}
              onDeleteMarker={handleDeleteMarker}
            />
          )}
        </div>
      </div>
    </div>
  )
}
