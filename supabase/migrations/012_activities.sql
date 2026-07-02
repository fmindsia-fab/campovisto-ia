-- Migration 012: Atividades & Kanban
create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  inspection_id uuid references public.inspections(id) on delete set null,
  report_id     uuid references public.reports(id) on delete set null,
  annotation_id uuid references public.image_annotations(id) on delete set null,
  title         text not null,
  description   text,
  category      text check (category in ('fence','waterer','pasture','soil','livestock','water','structure','inspection','other')),
  priority      text not null default 'medium' check (priority in ('high','medium','low')),
  status        text not null default 'planned' check (status in ('planned','started','done')),
  assigned_to   uuid references public.profiles(id) on delete set null,
  due_date      date,
  completed_at  timestamptz,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create trigger activities_updated_at before update on public.activities
  for each row execute function public.set_updated_at();

create index if not exists activities_status_idx on public.activities(status);
create index if not exists activities_inspection_id_idx on public.activities(inspection_id);
create index if not exists activities_assigned_to_idx on public.activities(assigned_to);

alter table public.activities enable row level security;

create policy "activities: autenticados leem" on public.activities
  for select using (auth.role() = 'authenticated');

create policy "activities: autenticados criam" on public.activities
  for insert with check (auth.role() = 'authenticated');

create policy "activities: autenticados atualizam" on public.activities
  for update using (auth.role() = 'authenticated');

create policy "activities: field_operator/admin deletam" on public.activities
  for delete using (public.has_role('admin') or public.has_role('field_operator'));

-- activity_comments: comentários de acompanhamento por atividade
create table if not exists public.activity_comments (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  content     text not null,
  created_at  timestamptz default now() not null
);

create index if not exists activity_comments_activity_id_idx on public.activity_comments(activity_id);

alter table public.activity_comments enable row level security;

create policy "activity_comments: autenticados leem" on public.activity_comments
  for select using (auth.role() = 'authenticated');

create policy "activity_comments: autenticados criam" on public.activity_comments
  for insert with check (auth.role() = 'authenticated');

create policy "activity_comments: autor ou admin deleta" on public.activity_comments
  for delete using (auth.uid() = user_id or public.has_role('admin'));
