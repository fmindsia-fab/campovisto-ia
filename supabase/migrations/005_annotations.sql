-- image_annotations: marcadores numerados sobre imagens de vistoria
create table if not exists public.image_annotations (
  id             uuid primary key default gen_random_uuid(),
  image_id       uuid not null references public.inspection_images(id) on delete cascade,
  marker_number  int not null,
  x_percent      float not null,
  y_percent      float not null,
  category       text not null check (category in (
    'bovine','pasture','bare_soil','cattle_trail','wetland',
    'fence','waterer','shade','crop','structure','attention_point'
  )),
  description    text,
  priority       text not null default 'medium' check (priority in ('high','medium','low')),
  confidence     text not null default 'probable' check (confidence in ('confirmed','probable','uncertain')),
  created_at     timestamptz default now() not null
);

-- RLS
alter table public.image_annotations enable row level security;

create policy "annotations: autenticados leem" on public.image_annotations
  for select using (auth.uid() is not null);

create policy "annotations: autenticados criam" on public.image_annotations
  for insert with check (auth.uid() is not null);

create policy "annotations: autenticados atualizam" on public.image_annotations
  for update using (auth.uid() is not null);

create policy "annotations: autenticados deletam" on public.image_annotations
  for delete using (auth.uid() is not null);
