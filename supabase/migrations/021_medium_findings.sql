-- Migration 021: corrige os 3 achados médios da auditoria de segurança
-- (o crítico — isolamento do papel client — já foi resolvido na 020)

-- ── 1. avatars: policy não restringia por dono ──────────────────────────
-- Antes, qualquer autenticado podia subir/sobrescrever o avatar de QUALQUER
-- usuário (o "with check"/"using" só validava auth.role(), não o caminho do
-- arquivo). storage_path é sempre `${userId}/${uuid}.ext` (ver
-- avatar-uploader.tsx) — agora exigimos que o primeiro segmento do caminho
-- bata com o auth.uid() de quem está subindo.
drop policy if exists "avatars: usuário envia o próprio" on storage.objects;
drop policy if exists "avatars: usuário atualiza o próprio" on storage.objects;

create policy "avatars: usuário envia o próprio" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: usuário atualiza o próprio" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 2. limites de plano só eram checados na aplicação ───────────────────
-- lib/plans/check-limit.ts dá a mensagem de erro bonita na UI, mas nada no
-- banco impedia alguém de chamar a API REST do Supabase direto (com o
-- próprio token de sessão) e contornar os limites do Free. Os triggers
-- abaixo são o backstop: só disparam quando o limite realmente estoura,
-- então não mudam o comportamento normal do app.

create or replace function public.enforce_property_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  max_props int;
  current_count int;
begin
  select pl.max_properties into max_props
  from public.subscriptions s join public.plans pl on pl.id = s.plan_id
  where s.user_id = new.created_by;

  if max_props is not null then
    select count(*) into current_count from public.properties where created_by = new.created_by;
    if current_count >= max_props then
      raise exception 'Limite do plano atingido: máximo % propriedade(s)', max_props;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists properties_enforce_limit on public.properties;
create trigger properties_enforce_limit before insert on public.properties
  for each row execute function public.enforce_property_limit();

create or replace function public.enforce_inspection_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  max_insp int;
  current_count int;
begin
  select pl.max_inspections into max_insp
  from public.subscriptions s join public.plans pl on pl.id = s.plan_id
  where s.user_id = new.operator_id;

  if max_insp is not null then
    select count(*) into current_count from public.inspections where operator_id = new.operator_id;
    if current_count >= max_insp then
      raise exception 'Limite do plano atingido: máximo % vistoria(s)', max_insp;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists inspections_enforce_limit on public.inspections;
create trigger inspections_enforce_limit before insert on public.inspections
  for each row execute function public.enforce_inspection_limit();

create or replace function public.enforce_image_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  max_imgs int;
  current_count int;
  owner_id uuid;
begin
  select operator_id into owner_id from public.inspections where id = new.inspection_id;

  select pl.max_images_per_inspection into max_imgs
  from public.subscriptions s join public.plans pl on pl.id = s.plan_id
  where s.user_id = owner_id;

  if max_imgs is not null then
    select count(*) into current_count from public.inspection_images where inspection_id = new.inspection_id;
    if current_count >= max_imgs then
      raise exception 'Limite do plano atingido: máximo % imagens por vistoria', max_imgs;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists inspection_images_enforce_limit on public.inspection_images;
create trigger inspection_images_enforce_limit before insert on public.inspection_images
  for each row execute function public.enforce_image_limit();

create or replace function public.enforce_ai_analysis_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  allowed boolean;
  owner_id uuid;
begin
  select operator_id into owner_id from public.inspections where id = new.inspection_id;

  select pl.ai_analysis into allowed
  from public.subscriptions s join public.plans pl on pl.id = s.plan_id
  where s.user_id = owner_id;

  if allowed is false then
    raise exception 'Análise por IA não disponível no plano atual';
  end if;

  return new;
end;
$$;

drop trigger if exists ai_analyses_enforce_plan on public.ai_analyses;
create trigger ai_analyses_enforce_plan before insert on public.ai_analyses
  for each row execute function public.enforce_ai_analysis_plan();

create or replace function public.enforce_pdf_export_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  allowed boolean;
  owner_id uuid;
begin
  if new.pdf_path is not distinct from old.pdf_path then
    return new;
  end if;

  select operator_id into owner_id from public.inspections where id = new.inspection_id;

  select pl.pdf_export into allowed
  from public.subscriptions s join public.plans pl on pl.id = s.plan_id
  where s.user_id = owner_id;

  if allowed is false then
    raise exception 'Exportação de PDF não disponível no plano atual';
  end if;

  return new;
end;
$$;

drop trigger if exists reports_enforce_pdf_plan on public.reports;
create trigger reports_enforce_pdf_plan before update on public.reports
  for each row execute function public.enforce_pdf_export_plan();

-- ── 3. drone-images / field-photos não estavam em nenhuma migration ────
-- Foram criados manualmente no dashboard — registrando aqui pra ficarem
-- versionados e reproduzíveis. `on conflict do nothing` não altera o que já
-- existe em produção; mantém público (o app usa getPublicUrl(), não
-- signed URLs, em vários lugares — trocar pra privado quebraria isso).
insert into storage.buckets (id, name, public)
values
  ('drone-images', 'drone-images', true),
  ('field-photos', 'field-photos', true)
on conflict (id) do nothing;

-- pode já existir policy homônima criada manualmente no dashboard — remove antes
drop policy if exists "drone-images: leitura pública" on storage.objects;
drop policy if exists "drone-images: autenticados enviam" on storage.objects;
drop policy if exists "drone-images: autenticados deletam" on storage.objects;
drop policy if exists "field-photos: leitura pública" on storage.objects;
drop policy if exists "field-photos: autenticados enviam" on storage.objects;
drop policy if exists "field-photos: autenticados deletam" on storage.objects;

create policy "drone-images: leitura pública" on storage.objects
  for select using (bucket_id = 'drone-images');

create policy "drone-images: autenticados enviam" on storage.objects
  for insert with check (bucket_id = 'drone-images' and auth.role() = 'authenticated');

create policy "drone-images: autenticados deletam" on storage.objects
  for delete using (bucket_id = 'drone-images' and auth.role() = 'authenticated');

create policy "field-photos: leitura pública" on storage.objects
  for select using (bucket_id = 'field-photos');

create policy "field-photos: autenticados enviam" on storage.objects
  for insert with check (bucket_id = 'field-photos' and auth.role() = 'authenticated');

create policy "field-photos: autenticados deletam" on storage.objects
  for delete using (bucket_id = 'field-photos' and auth.role() = 'authenticated');
