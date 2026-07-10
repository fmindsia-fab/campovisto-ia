'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, MapPin, ClipboardList, CheckSquare, FileText, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { SearchResults, SearchResultItem } from '@/lib/search/actions'

const SECTIONS: { key: keyof SearchResults; label: string; icon: typeof Users }[] = [
  { key: 'clients', label: 'Clientes', icon: Users },
  { key: 'properties', label: 'Propriedades', icon: MapPin },
  { key: 'inspections', label: 'Vistorias', icon: ClipboardList },
  { key: 'activities', label: 'Atividades', icon: CheckSquare },
  { key: 'reports', label: 'Relatórios', icon: FileText },
]

const EMPTY_RESULTS: SearchResults = { clients: [], properties: [], inspections: [], activities: [], reports: [] }

export function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(EMPTY_RESULTS)
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        const data = (await res.json()) as SearchResults
        setResults(data)
      } catch {
        // requisição cancelada ou falhou — mantém resultados anteriores
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => { clearTimeout(timeout); controller.abort() }
  }, [query])

  function go(item: SearchResultItem) {
    setOpen(false)
    setQuery('')
    router.push(item.href)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setQuery('')
  }

  const hasQuery = query.trim().length >= 2
  const totalResults = SECTIONS.reduce((sum, s) => sum + results[s.key].length, 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex w-72 items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/50 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>

      {/* abaixo do breakpoint md o botão acima fica hidden (não cabe na
          topbar mobile) — sem isso a busca global ficava inacessível no
          celular, já que o atalho ⌘K também não existe em teclado touch */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg p-0 gap-0 top-[20%] translate-y-0">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar clientes, propriedades, vistorias, atividades, relatórios..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!hasQuery && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </p>
            )}

            {hasQuery && !loading && totalResults === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado para &quot;{query}&quot;
              </p>
            )}

            {hasQuery && SECTIONS.map(({ key, label, icon: Icon }) => {
              const items = results[key]
              if (items.length === 0) return null
              return (
                <div key={key} className="mb-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => go(item)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="shrink-0 truncate max-w-[40%] text-xs text-muted-foreground">{item.subtitle}</span>
                      )}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          {hasQuery && totalResults > 0 && (
            <button
              onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`) }}
              className="border-t px-4 py-2.5 text-left text-xs font-medium text-primary hover:bg-muted"
            >
              Ver todos os resultados para &quot;{query}&quot;
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
