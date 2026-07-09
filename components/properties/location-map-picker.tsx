'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Search, Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse rounded-lg bg-muted" />,
})

// centro geográfico aproximado do Brasil — usado quando ainda não há coordenada
const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253]

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

interface Props {
  locationDefault?: string
  latDefault?: number | null
  lngDefault?: number | null
}

export function LocationMapPicker({ locationDefault = '', latDefault = null, lngDefault = null }: Props) {
  const [location, setLocation] = useState(locationDefault)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latDefault != null && lngDefault != null ? { lat: latDefault, lng: lngDefault } : null
  )
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!location.trim()) return
    setSearching(true)
    setResults([])
    setSearched(false)
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(location)}`)
      const data = (await res.json()) as NominatimResult[]
      setResults(Array.isArray(data) ? data : [])
    } catch {
      // busca falhou — usuário ainda pode marcar manualmente no mapa
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  function pickResult(r: NominatimResult) {
    setCoords({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) })
    setLocation(r.display_name)
    setResults([])
    setSearched(false)
  }

  const center = coords ? ([coords.lat, coords.lng] as [number, number]) : BRAZIL_CENTER

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Localização</Label>
      <div className="flex gap-2">
        <Input
          id="location"
          name="location"
          value={location}
          autoComplete="off"
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleSearch() }
          }}
          placeholder="Endereço, estrada, município..."
        />
        <Button type="button" variant="outline" size="icon" onClick={handleSearch} disabled={searching} title="Buscar no mapa">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="rounded-md border bg-popover shadow-sm max-h-40 overflow-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pickResult(r)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-muted"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
              {r.display_name}
            </button>
          ))}
        </div>
      )}

      {searched && results.length === 0 && (
        <p className="text-xs text-amber-600">
          Nenhum endereço encontrado. Localize a propriedade visualmente na imagem de satélite abaixo e clique para marcar o pino.
        </p>
      )}

      <LocationMap
        lat={center[0]}
        lng={center[1]}
        zoom={coords ? 14 : 4}
        onPick={(lat, lng) => setCoords({ lat, lng })}
      />

      <p className="text-xs text-muted-foreground">
        {coords
          ? `Coordenadas: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} — clique no mapa para ajustar`
          : 'Busque um endereço acima ou clique no mapa para marcar a localização exata'}
      </p>

      <input type="hidden" name="latitude" value={coords?.lat ?? ''} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ''} />
    </div>
  )
}
