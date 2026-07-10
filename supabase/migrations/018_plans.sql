-- plans: planos disponíveis (Free / Premium)
create table if not exists public.plans (
  id                        text primary key,
  name                      text not null,
  max_properties            int,   -- null = ilimitado
  max_inspections           int,   -- null = ilimitado
  max_images_per_inspection int,   -- null = ilimitado
  ai_analysis               boolean not null default false,
  pdf_export                boolean not null default false,
  price_monthly             numeric not null default 0,
  created_at                timestamptz default now() not null
);

insert into public.plans (id, name, max_properties, max_inspections, max_images_per_inspection, ai_analysis, pdf_export, price_monthly)
values
  ('free',    'Free',    1,    3,    5,    false, false, 0),
  ('premium', 'Premium', null, null, null, true,  true,  99.90)
on conflict (id) do update set
  name = excluded.name,
  max_properties = excluded.max_properties,
  max_inspections = excluded.max_inspections,
  max_images_per_inspection = excluded.max_images_per_inspection,
  ai_analysis = excluded.ai_analysis,
  pdf_export = excluded.pdf_export,
  price_monthly = excluded.price_monthly;

-- subscriptions: plano ativo de cada usuário
-- colunas stripe_* já modeladas (nullable) para a integração de billing futura — sem uso ainda
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  plan_id                text not null references public.plans(id) default 'free',
  status                 text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz default now() not null,
  updated_at             timestamptz default now() not null
);

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- RLS: plans (leitura pública para autenticados — precisa pra tela de comparação)
alter table public.plans enable row level security;

create policy "plans: autenticados leem" on public.plans
  for select using (auth.role() = 'authenticated');

-- RLS: subscriptions
alter table public.subscriptions enable row level security;

create policy "subscriptions: usuário lê a própria" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions: admin lê todas" on public.subscriptions
  for select using (public.has_role('admin'));

-- backfill: usuários existentes que ainda não têm assinatura entram no Free
insert into public.subscriptions (user_id, plan_id)
select id, 'free' from auth.users
on conflict (user_id) do nothing;

-- trigger: todo usuário novo já nasce no plano Free
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  default_role_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  select id into default_role_id from public.roles where name = 'field_operator';
  if default_role_id is not null then
    insert into public.user_roles (user_id, role_id) values (new.id, default_role_id);
  end if;

  insert into public.subscriptions (user_id, plan_id) values (new.id, 'free');

  return new;
end;
$$;
