'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string | null
  href: string
}

export interface SearchResults {
  clients: SearchResultItem[]
  properties: SearchResultItem[]
  inspections: SearchResultItem[]
  activities: SearchResultItem[]
  reports: SearchResultItem[]
}

function formatVisitDate(visitDate: string | null | undefined): string | null {
  if (!visitDate) return null
  return new Date(`${visitDate}T00:00:00`).toLocaleDateString('pt-BR')
}

export async function globalSearch(query: string, limit = 5): Promise<SearchResults> {
  const q = query.trim()
  if (q.length < 2) {
    return { clients: [], properties: [], inspections: [], activities: [], reports: [] }
  }

  const supabase = await createClient()
  const like = `%${q}%`

  const [clientsRes, propertiesRes, inspectionsRes, activitiesRes, reportsRes] = await Promise.all([
    (supabase as any).from('clients').select('id, name, city').ilike('name', like).limit(limit),
    (supabase as any).from('properties').select('id, name, clients(name)').ilike('name', like).limit(limit),
    (supabase as any).from('inspections').select('id, visit_date, objective, properties(name)').ilike('objective', like).limit(limit),
    (supabase as any).from('activities').select('id, title, status').ilike('title', like).limit(limit),
    (supabase as any).from('reports').select('id, title, status').ilike('title', like).limit(limit),
  ])

  return {
    clients: (clientsRes.data ?? []).map((c: any) => ({
      id: c.id,
      title: c.name,
      subtitle: c.city,
      href: `/clients/${c.id}`,
    })),
    properties: (propertiesRes.data ?? []).map((p: any) => ({
      id: p.id,
      title: p.name,
      subtitle: p.clients?.name ?? null,
      href: `/properties/${p.id}`,
    })),
    inspections: (inspectionsRes.data ?? []).map((i: any) => ({
      id: i.id,
      title: i.properties?.name ?? 'Vistoria',
      subtitle: [i.objective, formatVisitDate(i.visit_date)].filter(Boolean).join(' · ') || null,
      href: `/inspections/${i.id}`,
    })),
    activities: (activitiesRes.data ?? []).map((a: any) => ({
      id: a.id,
      title: a.title,
      subtitle: null,
      href: `/activities?open=${a.id}`,
    })),
    reports: (reportsRes.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      subtitle: null,
      href: `/reports/${r.id}`,
    })),
  }
}
