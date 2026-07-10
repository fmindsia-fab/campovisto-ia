-- Migration 022: corrige achados do code review sobre a auditoria anterior
-- (020/021) — todos confirmados por múltiplos agentes de revisão.

-- ── 1. triggers de limite de plano falhavam aberto sem subscriptions ────
-- Antes: se o join com subscriptions não encontrasse linha, a variável de
-- limite ficava NULL e o "if ... is not null" pulava a checagem inteira —
-- ou seja, usuário sem assinatura ficava SEM NENHUM limite no banco (o
-- oposto do que o trigger existe pra garantir). Hoje isso não é alcançável
-- na prática (todo usuário ganha uma assinatura Free no cadastro — 018), mas
-- o trigger não deveria depender disso pra ser seguro. Centraliza a busca
-- do plano numa função com fallback pro Free, e faz os 5 triggers usarem ela.
create or replace function public.user_plan(uid uuid)
returns public.plans language plpgsql stable security definer set search_path = public as $$
declare
  result public.plans;
begin
  select pl.* into result
  from public.subscriptions s
  join public.plans pl on pl.id = s.plan_id
  where s.user_id = uid;

  if not found then
    select pl.* into result from public.plans pl where pl.id = 'free';
  end if;

  return result;
end;
$$;

create or replace function public.enforce_property_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  plan public.plans;
  current_count int;
begin
  plan := public.user_plan(new.created_by);

  if plan.max_properties is not null then
    select count(*) into current_count from public.properties where created_by = new.created_by;
    if current_count >= plan.max_properties then
      raise exception 'Limite do plano atingido: máximo % propriedade(s)', plan.max_properties;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_inspection_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  plan public.plans;
  current_count int;
begin
  plan := public.user_plan(new.operator_id);

  if plan.max_inspections is not null then
    select count(*) into current_count from public.inspections where operator_id = new.operator_id;
    if current_count >= plan.max_inspections then
      raise exception 'Limite do plano atingido: máximo % vistoria(s)', plan.max_inspections;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_image_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  plan public.plans;
  current_count int;
  owner_id uuid;
begin
  select operator_id into owner_id from public.inspections where id = new.inspection_id;
  plan := public.user_plan(owner_id);

  if plan.max_images_per_inspection is not null then
    select count(*) into current_count from public.inspection_images where inspection_id = new.inspection_id;
    if current_count >= plan.max_images_per_inspection then
      raise exception 'Limite do plano atingido: máximo % imagens por vistoria', plan.max_images_per_inspection;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_ai_analysis_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  plan public.plans;
  owner_id uuid;
begin
  select operator_id into owner_id from public.inspections where id = new.inspection_id;
  plan := public.user_plan(owner_id);

  if plan.ai_analysis is false then
    raise exception 'Análise por IA não disponível no plano atual';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_pdf_export_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  plan public.plans;
  owner_id uuid;
begin
  if new.pdf_path is not distinct from old.pdf_path then
    return new;
  end if;

  select operator_id into owner_id from public.inspections where id = new.inspection_id;
  plan := public.user_plan(owner_id);

  if plan.pdf_export is false then
    raise exception 'Exportação de PDF não disponível no plano atual';
  end if;

  return new;
end;
$$;

-- ── 2. buckets drone-images/field-photos aceitavam qualquer autenticado ─
-- inspection_images (a tabela) já virou staff-only na migration 020, mas os
-- objetos brutos do Storage continuavam liberados pra "qualquer
-- autenticado" — um usuário só-client não inseria a linha no banco, mas
-- ainda conseguia subir/apagar arquivo direto no bucket.
drop policy if exists "drone-images: autenticados enviam" on storage.objects;
drop policy if exists "drone-images: autenticados deletam" on storage.objects;
drop policy if exists "field-photos: autenticados enviam" on storage.objects;
drop policy if exists "field-photos: autenticados deletam" on storage.objects;

create policy "drone-images: staff envia" on storage.objects
  for insert with check (bucket_id = 'drone-images' and public.is_staff());

create policy "drone-images: staff deleta" on storage.objects
  for delete using (bucket_id = 'drone-images' and public.is_staff());

create policy "field-photos: staff envia" on storage.objects
  for insert with check (bucket_id = 'field-photos' and public.is_staff());

create policy "field-photos: staff deleta" on storage.objects
  for delete using (bucket_id = 'field-photos' and public.is_staff());
