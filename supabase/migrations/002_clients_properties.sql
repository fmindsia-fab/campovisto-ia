-- clients: clientes/produtores rurais
create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  phone               text,
  email               text,
  city                text,
  notes               text,
  responsible_user_id uuid references auth.users(id) on delete set null,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- properties: propriedades rurais vinculadas a clientes
create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  name          text not null,
  location      text,
  activity_type text,
  notes         text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

-- RLS: clients
alter table public.clients enable row level security;

create policy "clients: autenticados leem" on public.clients
  for select using (auth.role() = 'authenticated');

create policy "clients: autenticados criam" on public.clients
  for insert with check (auth.role() = 'authenticated');

create policy "clients: autenticados atualizam" on public.clients
  for update using (auth.role() = 'authenticated');

create policy "clients: admin deleta" on public.clients
  for delete using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name in ('admin', 'field_operator')
    )
  );

-- RLS: properties
alter table public.properties enable row level security;

create policy "properties: autenticados leem" on public.properties
  for select using (auth.role() = 'authenticated');

create policy "properties: autenticados criam" on public.properties
  for insert with check (auth.role() = 'authenticated');

create policy "properties: autenticados atualizam" on public.properties
  for update using (auth.role() = 'authenticated');

create policy "properties: admin deleta" on public.properties
  for delete using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name in ('admin', 'field_operator')
    )
  );
