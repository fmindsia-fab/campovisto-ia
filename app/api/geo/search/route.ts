import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 3) return NextResponse.json([])

  const params = new URLSearchParams({ q, format: 'json', countrycodes: 'br', limit: '5' })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      // Nominatim exige identificação de quem consome a API pública
      'User-Agent': 'CampoVisto.IA/1.0 (https://campovisto.ia)',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Falha na busca de endereço' }, { status: 502 })
  }

  const data = await response.json()
  return NextResponse.json(data)
}
