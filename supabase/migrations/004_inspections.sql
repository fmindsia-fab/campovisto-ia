-- inspections: vistorias vinculadas a propriedades
create table if not exists public.inspections (
  id                   uuid primary key default gen_random_uuid(),
  property_id          uuid not null references public.properties(id) on delete cascade,
  operator_id          uuid references auth.users(id) on delete set null,
  visit_date           date not null,
  objective            text,
  status               text not null default 'draft' check (status in ('draft', 'in_progress', 'review_pending', 'completed')),
  general_observations text,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

create trigger inspections_updated_at before update on public.inspections
  for each row execute function public.set_updated_at();

-- inspection_images: imagens de drone e fotos de campo por vistoria
create table if not exists public.inspection_images (
  id                 uuid primary key default gen_random_uuid(),
  inspection_id      uuid not null references public.inspections(id) on delete cascade,
  storage_path       text not null,
  original_name      text not null,
  image_type         text check (image_type in ('overview','pasture','livestock','bare_soil','water','fence','waterer','crop','structure','wetland','other')),
  field_observations text,
  order_index        int not null default 0,
  created_at         timestamptz default now() not null
);

-- RLS: inspections
alter table public.inspections enable row level security;

create policy "inspections: autenticados leem" on public.inspections
  for select using (auth.role() = 'authenticated');

create policy "inspections: autenticados criam" on public.inspections
  for insert with check (auth.role() = 'authenticated');

create policy "inspections: autenticados atualizam" on public.inspections
  for update using (auth.role() = 'authenticated');

create policy "inspections: field_operator deleta" on public.inspections
  for delete using (
    public.has_role('admin') or public.has_role('field_operator')
  );

-- RLS: inspection_images
alter table public.inspection_images enable row level security;

create policy "inspection_images: autenticados leem" on public.inspection_images
  for select using (auth.role() = 'authenticated');

create policy "inspection_images: autenticados criam" on public.inspection_images
  for insert with check (auth.role() = 'authenticated');

create policy "inspection_images: autenticados atualizam" on public.inspection_images
  for update using (auth.role() = 'authenticated');

create policy "inspection_images: autenticados deletam" on public.inspection_images
  for delete using (auth.role() = 'authenticated');
