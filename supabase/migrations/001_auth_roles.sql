-- profiles: dados extras do usuário além do auth.users
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  phone      text,
  onboarding_completed_at timestamptz,
  onboarding_step         int default 0,
  created_at timestamptz default now() not null
);

-- roles: papéis disponíveis na plataforma
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  created_at  timestamptz default now() not null
);

-- user_roles: many-to-many entre usuários e papéis
create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- seed: papéis iniciais
insert into public.roles (name, description) values
  ('admin',           'Acesso total à plataforma'),
  ('field_operator',  'Cria e gerencia vistorias'),
  ('drone_pilot',     'Realiza voos e faz upload de imagens'),
  ('human_reviewer',  'Revisa e aprova análises de IA'),
  ('client',          'Visualiza relatórios das suas propriedades')
on conflict (name) do nothing;

-- RLS: profiles
alter table public.profiles enable row level security;

create policy "profiles: usuário lê o próprio" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: usuário edita o próprio" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: admin lê todos" on public.profiles
  for select using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- RLS: roles (leitura pública para usuários autenticados)
alter table public.roles enable row level security;

create policy "roles: autenticados leem" on public.roles
  for select using (auth.role() = 'authenticated');

-- RLS: user_roles
alter table public.user_roles enable row level security;

create policy "user_roles: usuário lê os próprios" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "user_roles: admin gerencia" on public.user_roles
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- trigger: cria profile automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  default_role_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  -- atribui role field_operator por padrão
  select id into default_role_id from public.roles where name = 'field_operator';
  if default_role_id is not null then
    insert into public.user_roles (user_id, role_id) values (new.id, default_role_id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
