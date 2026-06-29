'use client'

import { useEffect, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group } from 'react-konva'
import type { MarkerData } from '@/app/(app)/inspections/[id]/images/[imageId]/editor/annotation-editor'

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

interface Props {
  imageUrl: string
  markers: MarkerData[]
  selectedMarkerNumber: number | null
  addingMode: boolean
  scale: number
  onCanvasClick: (xPercent: number, yPercent: number) => void
  onMarkerClick: (marker: MarkerData) => void
}

export function AnnotationCanvas({
  imageUrl, markers, selectedMarkerNumber, addingMode, scale, onCanvasClick, onMarkerClick,
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
    if (!addingMode) return
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
      style={{ cursor: addingMode ? 'crosshair' : 'default' }}
      className="rounded-lg overflow-hidden shadow-lg"
    >
      <Stage
        width={stageW}
        height={stageH}
        scaleX={scale}
        scaleY={scale}
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
            const color = PRIORITY_COLORS[marker.priority] ?? '#f59e0b'
            const isSelected = marker.marker_number === selectedMarkerNumber
            const r = 16

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
                <Circle
                  x={0}
                  y={0}
                  radius={r}
                  fill={color}
                  stroke={isSelected ? '#ffffff' : 'rgba(0,0,0,0.4)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  shadowColor="black"
                  shadowBlur={isSelected ? 8 : 4}
                  shadowOpacity={0.4}
                />
                <Text
                  x={-r}
                  y={-r}
                  width={r * 2}
                  height={r * 2}
                  text={String(marker.marker_number)}
                  fontSize={13}
                  fontStyle="bold"
                  fill="white"
                  align="center"
                  verticalAlign="middle"
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
