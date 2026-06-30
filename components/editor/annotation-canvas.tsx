'use client'

import { useEffect, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group } from 'react-konva'
import type { MarkerData } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  bovine: '#f97316',        // laranja
  pasture: '#22c55e',       // verde
  bare_soil: '#a78b5c',     // marrom claro
  cattle_trail: '#8b5cf6',  // roxo
  wetland: '#06b6d4',       // ciano
  fence: '#6b7280',         // cinza
  waterer: '#3b82f6',       // azul
  shade: '#84cc16',         // verde limão
  crop: '#10b981',          // esmeralda
  structure: '#64748b',     // azul acinzentado
  attention_point: '#ef4444', // vermelho
  // categorias espectrais
  pasture_degradation: '#ef4444',
  water_stress: '#f97316',
  low_biomass: '#eab308',
  nutrient_deficiency: '#a78b5c',
  healthy_vegetation: '#22c55e',
}

const PRIORITY_BORDER: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

interface Props {
  imageUrl: string
  markers: MarkerData[]
  selectedMarkerNumber: number | null
  addingMode: boolean
  panMode: boolean
  scale: number
  onCanvasClick: (xPercent: number, yPercent: number) => void
  onMarkerClick: (marker: MarkerData) => void
}

export function AnnotationCanvas({
  imageUrl, markers, selectedMarkerNumber, addingMode, panMode, scale, onCanvasClick, onMarkerClick,
}: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.src = imageUrl
    image.onload = () => {
      const maxW = Math.min(image.naturalWidth, 1200)
      const ratio = image.naturalHeight / image.naturalWidth
      setSize({ w: maxW, h: Math.round(maxW * ratio) })
      setImg(image)
    }
  }, [imageUrl])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleStageClick(e: any) {
    if (!addingMode || panMode) return
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return
    const xPercent = (pos.x / scale) / size.w
    const yPercent = (pos.y / scale) / size.h
    onCanvasClick(xPercent, yPercent)
  }

  const stageW = size.w * scale
  const stageH = size.h * scale

  return (
    <div
      style={{ cursor: panMode ? 'grab' : addingMode ? 'crosshair' : 'default' }}
      className="rounded-lg overflow-hidden shadow-lg"
    >
      <Stage
        width={stageW}
        height={stageH}
        scaleX={scale}
        scaleY={scale}
        draggable={panMode}
        onClick={handleStageClick}
      >
        <Layer>
          {img && (
            <KonvaImage image={img} x={0} y={0} width={size.w} height={size.h} />
          )}
        </Layer>
        <Layer>
          {markers.map((marker) => {
            const x = marker.x_percent * size.w
            const y = marker.y_percent * size.h
            const color = CATEGORY_COLORS[marker.category] ?? '#f59e0b'
            const borderColor = PRIORITY_BORDER[marker.priority] ?? '#f59e0b'
            const isSelected = marker.marker_number === selectedMarkerNumber
            const r = isSelected ? 9 : 6

            return (
              <Group
                key={marker.marker_number}
                x={x}
                y={y}
                onClick={(e) => {
                  e.cancelBubble = true
                  onMarkerClick(marker)
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* anel branco externo para contraste sobre qualquer fundo */}
                <Circle
                  x={0}
                  y={0}
                  radius={r + 2}
                  fill="white"
                  opacity={0.85}
                />
                {/* ponto colorido por categoria, borda por prioridade */}
                <Circle
                  x={0}
                  y={0}
                  radius={r}
                  fill={color}
                  stroke={isSelected ? '#ffffff' : borderColor}
                  strokeWidth={isSelected ? 2 : 1.5}
                  shadowColor="black"
                  shadowBlur={isSelected ? 6 : 3}
                  shadowOpacity={0.5}
                />
                {/* número pequeno acima do ponto */}
                <Text
                  x={r + 3}
                  y={-(r + 2)}
                  text={String(marker.marker_number)}
                  fontSize={10}
                  fontStyle="bold"
                  fill="white"
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.9}
                  listening={false}
                />
              </Group>
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
