-- reports: relatórios gerados a partir de vistorias aprovadas
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  title         text not null,
  status        text not null default 'draft' check (status in ('draft', 'review_pending', 'approved', 'published')),
  generated_by  uuid references auth.users(id) on delete set null,
  approved_by   uuid references auth.users(id) on delete set null,
  pdf_path      text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create trigger reports_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- RLS: reports
alter table public.reports enable row level security;

create policy "reports: autenticados leem" on public.reports
  for select using (auth.role() = 'authenticated');

create policy "reports: autenticados criam" on public.reports
  for insert with check (auth.role() = 'authenticated');

create policy "reports: autenticados atualizam" on public.reports
  for update using (auth.role() = 'authenticated');

create policy "reports: admin deleta" on public.reports
  for delete using (public.has_role('admin') or public.has_role('field_operator'));
