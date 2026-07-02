'use client'

import { Camera, Satellite } from 'lucide-react'
import { RGB_TYPES, SPECTRAL_TYPES } from './image-types'

export { RGB_TYPES, SPECTRAL_TYPES, ALL_IMAGE_TYPE_LABELS } from './image-types'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function ImageTypeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* RGB */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Camera className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Imagem RGB — câmera comum
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {RGB_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`rounded-lg border p-2.5 text-left transition-colors hover:border-primary/50 ${
                value === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <p className="text-xs font-medium leading-tight">{t.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Multispectral */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Satellite className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            Índice Vegetal — câmera multiespectral
          </p>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {SPECTRAL_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`rounded-lg border p-2.5 text-left transition-colors hover:border-primary/50 ${
                value === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <p className="text-xs font-semibold leading-tight">{t.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
