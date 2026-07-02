-- Migration 011: garante papel admin para usuários já existentes
-- A migration 010 passou a exigir human_reviewer/admin para aprovar/rejeitar
-- análises de IA. Como a gestão de papéis via UI só existe a partir do M14,
-- sem este grant nenhum usuário atual conseguiria revisar análises.
-- Novos usuários continuam recebendo apenas field_operator por padrão
-- (handle_new_user, migration 001) até que o M14 introduza atribuição de papéis.

insert into public.user_roles (user_id, role_id)
select u.id, r.id
from auth.users u
cross join public.roles r
where r.name = 'admin'
  and not exists (
    select 1 from public.user_roles ur
    where ur.user_id = u.id and ur.role_id = r.id
  );
