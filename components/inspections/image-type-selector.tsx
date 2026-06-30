'use client'

import { Camera, Satellite } from 'lucide-react'

export const RGB_TYPES = [
  { value: 'overview',   label: 'Visão geral',   description: 'Vista aérea geral da propriedade' },
  { value: 'pasture',    label: 'Pastagem',       description: 'Área de pastagem e forragem' },
  { value: 'livestock',  label: 'Rebanho',        description: 'Animais visíveis na imagem' },
  { value: 'bare_soil',  label: 'Solo exposto',   description: 'Área sem cobertura vegetal' },
  { value: 'water',      label: 'Água',           description: 'Açude, rio, bebedouro natural' },
  { value: 'fence',      label: 'Cerca',          description: 'Cercamento e divisões de pasto' },
  { value: 'waterer',    label: 'Bebedouro',      description: 'Bebedouro artificial' },
  { value: 'crop',       label: 'Lavoura',        description: 'Área de cultivo agrícola' },
  { value: 'structure',  label: 'Estrutura',      description: 'Galpão, curral, instalação' },
  { value: 'wetland',    label: 'Área úmida',     description: 'Brejo, várzea, área alagada' },
  { value: 'other',      label: 'Outro',          description: 'Outro tipo de imagem' },
]

export const SPECTRAL_TYPES = [
  { value: 'ndvi', label: 'NDVI', description: 'Saúde geral da vegetação — detecta degradação, biomassa e vigor' },
  { value: 'ndre', label: 'NDRE', description: 'Vigor em vegetação densa — detecta deficiências nutricionais' },
  { value: 'evi',  label: 'EVI',  description: 'Vegetação exuberante — corrige saturação do NDVI' },
  { value: 'savi', label: 'SAVI', description: 'Baixa cobertura vegetal — ideal para pastagens degradadas' },
  { value: 'ndwi', label: 'NDWI', description: 'Estresse hídrico — detecta déficit de água nas plantas' },
]

export const ALL_IMAGE_TYPE_LABELS: Record<string, string> = {
  ...Object.fromEntries(RGB_TYPES.map((t) => [t.value, t.label])),
  ...Object.fromEntries(SPECTRAL_TYPES.map((t) => [t.value, t.label])),
}

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
