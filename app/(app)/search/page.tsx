import Link from 'next/link'
import { Search, Users, MapPin, ClipboardList, CheckSquare, FileText } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { globalSearch, type SearchResults } from '@/lib/search/actions'

interface Props {
  searchParams: Promise<{ q?: string }>
}

const SECTIONS: { key: keyof SearchResults; label: string; icon: typeof Users }[] = [
  { key: 'clients', label: 'Clientes', icon: Users },
  { key: 'properties', label: 'Propriedades', icon: MapPin },
  { key: 'inspections', label: 'Vistorias', icon: ClipboardList },
  { key: 'activities', label: 'Atividades', icon: CheckSquare },
  { key: 'reports', label: 'Relatórios', icon: FileText },
]

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const results = await globalSearch(q, 30)
  const total = SECTIONS.reduce((sum, s) => sum + results[s.key].length, 0)

  return (
    <>
      <PageHeader title="Busca" description={q ? `Resultados para "${q}"` : 'Digite um termo para buscar'} />

      {q.trim().length < 2 ? (
        <EmptyState icon={Search} title="Digite pelo menos 2 caracteres" description="Use a busca no topo da tela (⌘K) ou a barra de endereço com ?q=." />
      ) : total === 0 ? (
        <EmptyState icon={Search} title="Nenhum resultado encontrado" description={`Não encontramos nada para "${q}".`} />
      ) : (
        <div className="space-y-6">
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const items = results[key]
            if (items.length === 0) return null
            return (
              <div key={key}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                  <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
                </h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <Card className="h-full transition-colors hover:border-primary/50">
                        <CardContent className="p-4">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          {item.subtitle && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.subtitle}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
