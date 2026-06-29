-- Cria função security definer para verificar roles sem acionar RLS
-- Evita infinite recursion nas policies que consultam user_roles
create or replace function public.has_role(role_name text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = role_name
  )
$$;

-- Corrige policy recursiva em user_roles
drop policy if exists "user_roles: admin gerencia" on public.user_roles;
create policy "user_roles: admin gerencia" on public.user_roles
  for all using (public.has_role('admin'));

-- Corrige policy de profiles que também consultava user_roles
drop policy if exists "profiles: admin lê todos" on public.profiles;
create policy "profiles: admin lê todos" on public.profiles
  for select using (public.has_role('admin'));

-- Corrige policies de delete em clients e properties
drop policy if exists "clients: admin deleta" on public.clients;
create policy "clients: field_operator deleta" on public.clients
  for delete using (
    public.has_role('admin') or public.has_role('field_operator')
  );

drop policy if exists "properties: admin deleta" on public.properties;
create policy "properties: field_operator deleta" on public.properties
  for delete using (
    public.has_role('admin') or public.has_role('field_operator')
  );
