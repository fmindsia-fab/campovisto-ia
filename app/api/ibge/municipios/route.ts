import { NextResponse } from 'next/server'
import { getMunicipios } from '@/lib/geo/ibge'

export async function GET() {
  try {
    const municipios = await getMunicipios()
    return NextResponse.json(municipios, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar municípios' },
      { status: 500 }
    )
  }
}
