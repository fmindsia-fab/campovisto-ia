export interface Municipio {
  id: number
  nome: string
  uf: string
}

interface IbgeMunicipioRaw {
  id: number
  nome: string
  microrregiao?: { mesorregiao?: { UF?: { sigla: string } } }
  'regiao-imediata'?: { 'regiao-intermediaria'?: { UF?: { sigla: string } } }
}

let cache: { data: Municipio[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // municípios do Brasil praticamente nunca mudam

export async function getMunicipios(): Promise<Municipio[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data
  }

  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
  if (!response.ok) throw new Error('Falha ao buscar municípios do IBGE')

  const raw = (await response.json()) as IbgeMunicipioRaw[]

  const data: Municipio[] = raw.map((m) => ({
    id: m.id,
    nome: m.nome,
    uf: m.microrregiao?.mesorregiao?.UF?.sigla
      ?? m['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla
      ?? '',
  }))

  cache = { data, fetchedAt: Date.now() }
  return data
}
