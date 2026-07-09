import { NextRequest, NextResponse } from 'next/server'
import { globalSearch } from '@/lib/search/actions'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 5)

  const results = await globalSearch(q, limit)
  return NextResponse.json(results)
}
