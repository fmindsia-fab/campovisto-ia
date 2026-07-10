-- profiles: ativação de conta e preferências de notificação
alter table public.profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists notification_preferences jsonb not null default
    '{"report_ready": true, "activity_overdue": true, "analysis_pending_review": true}'::jsonb;

-- impede que o próprio usuário reative/desative a conta pela policy de "edita o
-- próprio perfil" — só admin pode mudar is_active (via update em outra sessão)
create or replace function public.guard_profile_is_active()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_active is distinct from old.is_active and not public.has_role('admin') then
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_is_active on public.profiles;
create trigger profiles_guard_is_active before update on public.profiles
  for each row execute function public.guard_profile_is_active();

-- admin precisa poder atualizar o profile de QUALQUER usuário (ex: desativar
-- conta) — a policy existente de "edita o próprio" só cobre auth.uid() = id
create policy "profiles: admin atualiza todos" on public.profiles
  for update using (public.has_role('admin'));

-- bucket de avatares — imagens de perfil dos usuários
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: leitura pública" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars: usuário envia o próprio" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars: usuário atualiza o próprio" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');
