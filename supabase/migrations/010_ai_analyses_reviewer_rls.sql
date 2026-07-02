-- Migration 010: restringe aprovação/rejeição de análises de IA a human_reviewer/admin
-- A policy de update anterior (006_ai_analyses.sql) permitia qualquer autenticado
-- aprovar/rejeitar/editar, inclusive a própria análise — quebra a regra de
-- "apenas human_reviewer aprova" do CLAUDE.md.

drop policy if exists "ai_analyses_update" on public.ai_analyses;

create policy "ai_analyses_update"
  on public.ai_analyses for update
  using (public.has_role('human_reviewer') or public.has_role('admin'));
