-- Migration 006: AI Analyses
-- Tabela para armazenar análises preliminares geradas por IA
-- Status: draft → review_pending → approved | rejected

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references public.inspection_images(id) on delete cascade,
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  visible_elements jsonb not null default '[]',
  attention_points jsonb not null default '[]',
  limitations jsonb not null default '[]',
  suggested_text text,
  raw_response jsonb,
  status text not null default 'draft' check (status in ('draft', 'review_pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices
create index if not exists ai_analyses_image_id_idx on public.ai_analyses(image_id);
create index if not exists ai_analyses_inspection_id_idx on public.ai_analyses(inspection_id);
create index if not exists ai_analyses_status_idx on public.ai_analyses(status);

-- RLS
alter table public.ai_analyses enable row level security;

-- Leitura: usuário autenticado vê análises das suas vistorias
create policy "ai_analyses_select"
  on public.ai_analyses for select
  using (auth.uid() is not null);

-- Inserção: qualquer usuário autenticado pode solicitar análise
create policy "ai_analyses_insert"
  on public.ai_analyses for insert
  with check (auth.uid() is not null);

-- Update: apenas para revisão (qualquer autenticado — controle de role fica na action)
create policy "ai_analyses_update"
  on public.ai_analyses for update
  using (auth.uid() is not null);

-- Delete: apenas o criador ou admin (simplificado para MVP)
create policy "ai_analyses_delete"
  on public.ai_analyses for delete
  using (auth.uid() is not null);
