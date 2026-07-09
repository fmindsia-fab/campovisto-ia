'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Municipio } from '@/lib/geo/ibge'

interface Props {
  defaultValue?: string
}

export function CityAutocomplete({ defaultValue = '' }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function ensureLoaded() {
    if (loaded) return
    setLoaded(true)
    try {
      const res = await fetch('/api/ibge/municipios')
      const data = (await res.json()) as Municipio[]
      setMunicipios(Array.isArray(data) ? data : [])
    } catch {
      // busca falhou — o campo continua editável como texto livre
    }
  }

  const normalized = query.trim().toLowerCase()
  const matches = normalized.length >= 2
    ? municipios.filter((m) => `${m.nome} ${m.uf}`.toLowerCase().includes(normalized)).slice(0, 8)
    : []

  function select(m: Municipio) {
    setQuery(`${m.nome} - ${m.uf}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id="city"
        name="city"
        value={query}
        autoComplete="off"
        onFocus={() => { void ensureLoaded(); setOpen(true) }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        placeholder="Digite o nome da cidade"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => select(m)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {m.nome} <span className="text-muted-foreground">— {m.uf}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
