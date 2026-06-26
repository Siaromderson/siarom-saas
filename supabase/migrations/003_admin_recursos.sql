-- ============================================================
--  Siarom AI — Admin & liberação de recursos por cliente
--  Idempotente. Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) EMPRESAS — flag de admin + seções liberadas manualmente
-- ----------------------------------------------------------------
alter table public.empresas
  add column if not exists is_admin boolean default false;

-- Array de SectionId (ex.: ["kanban","agenda"]) liberados além do plano.
alter table public.empresas
  add column if not exists recursos_liberados jsonb default '[]'::jsonb;

-- ----------------------------------------------------------------
-- 2) Marque a SUA conta como admin (troque o email se necessário)
--    O painel /admin também reconhece o email via env ADMIN_EMAILS.
-- ----------------------------------------------------------------
update public.empresas
   set is_admin = true
 where lower(email) = lower('morais2730@gmail.com');

-- ----------------------------------------------------------------
-- 3) RLS — admin enxerga e gerencia TODAS as empresas e dados.
--    (As policies do usuário comum continuam valendo; estas somam.)
-- ----------------------------------------------------------------
-- Helper: a empresa do usuário atual é admin?
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.empresas e
    where e.user_id = auth.uid() and e.is_admin = true
  );
$$;

-- EMPRESAS: admin lê e atualiza todas
drop policy if exists empresas_admin_select on public.empresas;
create policy empresas_admin_select on public.empresas
  for select using (public.is_admin_user());

drop policy if exists empresas_admin_update on public.empresas;
create policy empresas_admin_update on public.empresas
  for update using (public.is_admin_user());

-- CHATS / AGENDAMENTOS / FEEDBACKS: admin lê tudo (para o painel)
drop policy if exists chats_admin_select on public.chats;
create policy chats_admin_select on public.chats
  for select using (public.is_admin_user());

drop policy if exists agendamentos_admin_select on public.agendamentos;
create policy agendamentos_admin_select on public.agendamentos
  for select using (public.is_admin_user());

drop policy if exists feedbacks_admin_select on public.feedbacks;
create policy feedbacks_admin_select on public.feedbacks
  for select using (public.is_admin_user());

-- ============================================================
--  FIM
-- ============================================================
