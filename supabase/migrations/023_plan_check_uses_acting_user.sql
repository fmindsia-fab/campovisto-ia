-- Migration 023: os triggers de limite de imagem/IA/PDF (021/022) checavam
-- o plano de quem CRIOU a vistoria (inspections.operator_id), não de quem
-- está logado fazendo a ação agora. Na prática isso causa um bug confuso:
-- o usuário edita o próprio plano pra Premium no Supabase, mas continua
-- vendo "não disponível no plano Free" porque a vistoria em questão foi
-- criada antes, ou por outra sessão, e o dono registrado é outro.
--
-- Volta a checar sempre quem está autenticado agora (auth.uid()), que é
-- também o que lib/plans/check-limit.ts faz no lado da aplicação — as duas
-- camadas ficam de novo consistentes, só que na semântica mais intuitiva
-- (o SEU plano é o que vale pras SUAS ações).

create or replace function public.enforce_image_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  plan public.plans;
  current_count int;
begin
  plan := public.user_plan(auth.uid());

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
begin
  plan := public.user_plan(auth.uid());

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
begin
  if new.pdf_path is not distinct from old.pdf_path then
    return new;
  end if;

  plan := public.user_plan(auth.uid());

  if plan.pdf_export is false then
    raise exception 'Exportação de PDF não disponível no plano atual';
  end if;

  return new;
end;
$$;
