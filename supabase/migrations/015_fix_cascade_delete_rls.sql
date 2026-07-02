-- Migration 015: corrige incompatibilidade de RLS entre activities e activity_comments
--
-- Problema: `activities` permite exclusão por admin OU field_operator (migration 012),
-- mas `activity_comments` (que tem FK ON DELETE CASCADE para activities) só permitia
-- o autor do próprio comentário ou um admin. Quando um field_operator excluía uma
-- atividade com comentário de outra pessoa (ex.: de um admin ou de outro
-- field_operator), o cascade falhava a checagem de RLS da tabela filha e o Postgres
-- recusava a exclusão inteira.
--
-- Correção: adiciona field_operator à policy de delete de activity_comments,
-- alinhando com a policy de delete de activities.

drop policy if exists "activity_comments: autor ou admin deleta" on public.activity_comments;

create policy "activity_comments: autor, field_operator ou admin deleta" on public.activity_comments
  for delete using (auth.uid() = user_id or public.has_role('admin') or public.has_role('field_operator'));
