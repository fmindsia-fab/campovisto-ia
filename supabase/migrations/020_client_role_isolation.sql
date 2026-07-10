-- Migration 020: isola o papel `client` — hoje QUALQUER usuário autenticado
-- (inclusive alguém com papel apenas `client`) enxerga e edita os dados de
-- TODOS os clientes/propriedades/vistorias/relatórios da plataforma, porque
-- as policies de 002/004/005/006/008/012/013 usam `auth.role() = 'authenticated'`
-- sem checar papel. O CLAUDE.md define `client` como "visualiza relatórios das
-- suas propriedades" — ou seja, deveria ver só o que é dele.
--
-- Estratégia:
--   1. clients.linked_user_id liga um auth.users a um registro de cliente
--      específico (setado pelo admin ao convidar um produtor de verdade).
--   2. public.is_staff() = admin/field_operator/drone_pilot/human_reviewer
--      (mantém acesso total, como já era).
--   3. Um usuário com APENAS o papel `client` só lê (nunca escreve) as linhas
--      ligadas ao seu linked_user_id, via join até `clients`.
--   4. activities/calendar_events/activity_comments são gestão interna —
--      client não vê nada nelas (nenhuma policy nova = acesso negado).

alter table public.clients
  add column if not exists linked_user_id uuid references auth.users(id) on delete set null;

create index if not exists clients_linked_user_id_idx on public.clients(linked_user_id);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name in ('admin', 'field_operator', 'drone_pilot', 'human_reviewer')
  );
$$;

-- ── clients ──────────────────────────────────────────────────────────────
drop policy if exists "clients: autenticados leem" on public.clients;
drop policy if exists "clients: autenticados criam" on public.clients;
drop policy if exists "clients: autenticados atualizam" on public.clients;

create policy "clients: staff le tudo, client le o proprio" on public.clients
  for select using (public.is_staff() or linked_user_id = auth.uid());

create policy "clients: staff cria" on public.clients
  for insert with check (public.is_staff());

create policy "clients: staff atualiza" on public.clients
  for update using (public.is_staff());

-- ── properties ───────────────────────────────────────────────────────────
drop policy if exists "properties: autenticados leem" on public.properties;
drop policy if exists "properties: autenticados criam" on public.properties;
drop policy if exists "properties: autenticados atualizam" on public.properties;

create policy "properties: staff le tudo, client le o proprio" on public.properties
  for select using (
    public.is_staff() or exists (
      select 1 from public.clients c
      where c.id = properties.client_id and c.linked_user_id = auth.uid()
    )
  );

create policy "properties: staff cria" on public.properties
  for insert with check (public.is_staff());

create policy "properties: staff atualiza" on public.properties
  for update using (public.is_staff());

-- ── inspections ──────────────────────────────────────────────────────────
drop policy if exists "inspections: autenticados leem" on public.inspections;
drop policy if exists "inspections: autenticados criam" on public.inspections;
drop policy if exists "inspections: autenticados atualizam" on public.inspections;

create policy "inspections: staff le tudo, client le o proprio" on public.inspections
  for select using (
    public.is_staff() or exists (
      select 1 from public.properties p
      join public.clients c on c.id = p.client_id
      where p.id = inspections.property_id and c.linked_user_id = auth.uid()
    )
  );

create policy "inspections: staff cria" on public.inspections
  for insert with check (public.is_staff());

create policy "inspections: staff atualiza" on public.inspections
  for update using (public.is_staff());

-- ── inspection_images (cliente precisa ler para ver o relatório) ────────
drop policy if exists "inspection_images: autenticados leem" on public.inspection_images;
drop policy if exists "inspection_images: autenticados criam" on public.inspection_images;
drop policy if exists "inspection_images: autenticados atualizam" on public.inspection_images;
drop policy if exists "inspection_images: autenticados deletam" on public.inspection_images;

create policy "inspection_images: staff le tudo, client le o proprio" on public.inspection_images
  for select using (
    public.is_staff() or exists (
      select 1 from public.inspections i
      join public.properties p on p.id = i.property_id
      join public.clients c on c.id = p.client_id
      where i.id = inspection_images.inspection_id and c.linked_user_id = auth.uid()
    )
  );

create policy "inspection_images: staff cria" on public.inspection_images
  for insert with check (public.is_staff());

create policy "inspection_images: staff atualiza" on public.inspection_images
  for update using (public.is_staff());

create policy "inspection_images: staff deleta" on public.inspection_images
  for delete using (public.is_staff());

-- ── image_annotations (marcadores — cliente vê no relatório) ────────────
drop policy if exists "annotations: autenticados leem" on public.image_annotations;
drop policy if exists "annotations: autenticados criam" on public.image_annotations;
drop policy if exists "annotations: autenticados atualizam" on public.image_annotations;
drop policy if exists "annotations: autenticados deletam" on public.image_annotations;

create policy "annotations: staff le tudo, client le o proprio" on public.image_annotations
  for select using (
    public.is_staff() or exists (
      select 1 from public.inspection_images img
      join public.inspections i on i.id = img.inspection_id
      join public.properties p on p.id = i.property_id
      join public.clients c on c.id = p.client_id
      where img.id = image_annotations.image_id and c.linked_user_id = auth.uid()
    )
  );

create policy "annotations: staff cria" on public.image_annotations
  for insert with check (public.is_staff());

create policy "annotations: staff atualiza" on public.image_annotations
  for update using (public.is_staff());

create policy "annotations: staff deleta" on public.image_annotations
  for delete using (public.is_staff());

-- ── ai_analyses (cliente só vê análises já aprovadas dos seus imóveis) ──
drop policy if exists "ai_analyses_select" on public.ai_analyses;
drop policy if exists "ai_analyses_insert" on public.ai_analyses;
drop policy if exists "ai_analyses_delete" on public.ai_analyses;

create policy "ai_analyses_select" on public.ai_analyses
  for select using (
    public.is_staff() or (
      status = 'approved' and exists (
        select 1 from public.inspections i
        join public.properties p on p.id = i.property_id
        join public.clients c on c.id = p.client_id
        where i.id = ai_analyses.inspection_id and c.linked_user_id = auth.uid()
      )
    )
  );

create policy "ai_analyses_insert" on public.ai_analyses
  for insert with check (public.is_staff());

create policy "ai_analyses_delete" on public.ai_analyses
  for delete using (public.is_staff());

-- ── reports ──────────────────────────────────────────────────────────────
drop policy if exists "reports: autenticados leem" on public.reports;
drop policy if exists "reports: autenticados criam" on public.reports;
drop policy if exists "reports: autenticados atualizam" on public.reports;

create policy "reports: staff le tudo, client le o proprio" on public.reports
  for select using (
    public.is_staff() or exists (
      select 1 from public.inspections i
      join public.properties p on p.id = i.property_id
      join public.clients c on c.id = p.client_id
      where i.id = reports.inspection_id and c.linked_user_id = auth.uid()
    )
  );

create policy "reports: staff cria" on public.reports
  for insert with check (public.is_staff());

create policy "reports: staff atualiza" on public.reports
  for update using (public.is_staff());

-- ── activities / calendar_events / activity_comments ────────────────────
-- gestão interna da equipe — client não enxerga nada aqui (só substitui as
-- policies antigas "qualquer autenticado" por "só staff")
drop policy if exists "activities: autenticados leem" on public.activities;
drop policy if exists "activities: autenticados criam" on public.activities;
drop policy if exists "activities: autenticados atualizam" on public.activities;

create policy "activities: staff le" on public.activities
  for select using (public.is_staff());

create policy "activities: staff cria" on public.activities
  for insert with check (public.is_staff());

create policy "activities: staff atualiza" on public.activities
  for update using (public.is_staff());

drop policy if exists "activity_comments: autenticados leem" on public.activity_comments;
drop policy if exists "activity_comments: autenticados criam" on public.activity_comments;

create policy "activity_comments: staff le" on public.activity_comments
  for select using (public.is_staff());

create policy "activity_comments: staff cria" on public.activity_comments
  for insert with check (public.is_staff());

drop policy if exists "calendar_events: autenticados leem" on public.calendar_events;
drop policy if exists "calendar_events: autenticados criam" on public.calendar_events;
drop policy if exists "calendar_events: autenticados atualizam" on public.calendar_events;

create policy "calendar_events: staff le" on public.calendar_events
  for select using (public.is_staff());

create policy "calendar_events: staff cria" on public.calendar_events
  for insert with check (public.is_staff());

create policy "calendar_events: staff atualiza" on public.calendar_events
  for update using (public.is_staff());
