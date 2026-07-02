-- Migration 013: Calendário
create table if not exists public.calendar_events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  event_type    text not null check (event_type in ('visit', 'report_deadline', 'activity', 'revisit')),
  start_date    date not null,
  end_date      date,
  all_day       boolean not null default true,
  inspection_id uuid references public.inspections(id) on delete cascade,
  activity_id   uuid references public.activities(id) on delete cascade,
  report_id     uuid references public.reports(id) on delete cascade,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now() not null
);

create index if not exists calendar_events_start_date_idx on public.calendar_events(start_date);
create index if not exists calendar_events_inspection_id_idx on public.calendar_events(inspection_id);
create index if not exists calendar_events_activity_id_idx on public.calendar_events(activity_id);

alter table public.calendar_events enable row level security;

create policy "calendar_events: autenticados leem" on public.calendar_events
  for select using (auth.role() = 'authenticated');

create policy "calendar_events: autenticados criam" on public.calendar_events
  for insert with check (auth.role() = 'authenticated');

create policy "calendar_events: autenticados atualizam" on public.calendar_events
  for update using (auth.role() = 'authenticated');

create policy "calendar_events: field_operator/admin deletam" on public.calendar_events
  for delete using (public.has_role('admin') or public.has_role('field_operator'));

-- Backfill: gera eventos para vistorias e atividades já existentes antes desta migration
insert into public.calendar_events (title, event_type, start_date, inspection_id, created_by)
select 'Visita — ' || coalesce(p.name, 'Vistoria'), 'visit', i.visit_date, i.id, i.operator_id
from public.inspections i
left join public.properties p on p.id = i.property_id
where not exists (
  select 1 from public.calendar_events ce where ce.inspection_id = i.id and ce.event_type = 'visit'
);

insert into public.calendar_events (title, event_type, start_date, activity_id, created_by)
select a.title, 'activity', a.due_date, a.id, a.created_by
from public.activities a
where a.due_date is not null
  and not exists (
    select 1 from public.calendar_events ce where ce.activity_id = a.id and ce.event_type = 'activity'
  );
