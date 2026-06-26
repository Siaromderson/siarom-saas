-- ============================================================
--  Siarom AI — Migração do CRM  (reconciliada com o schema real)
--  Idempotente: pode rodar mais de uma vez sem erro.
--  Suas tabelas já têm quase tudo; aqui adicionamos só o que falta
--  e configuramos o isolamento multi-tenant (RLS).
--  Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) EMPRESAS — garante índice único do vínculo com o usuário
--    (todas as colunas usadas pelo app já existem)
-- ----------------------------------------------------------------
create unique index if not exists empresas_user_id_key on public.empresas(user_id);

-- ----------------------------------------------------------------
-- 2) CHATS — só falta o canal (WhatsApp/Instagram/Facebook)
--    Demais colunas usadas já existem: nome, telefone, status,
--    etapa, sentimento, followup, ultima_interacao, historico, created_at.
-- ----------------------------------------------------------------
alter table public.chats
  add column if not exists canal text default 'whatsapp';   -- whatsapp | instagram | facebook

create index if not exists chats_empresa_idx       on public.chats(empresa_id);
create index if not exists chats_empresa_etapa_idx on public.chats(empresa_id, etapa);
create index if not exists chats_empresa_created_idx on public.chats(empresa_id, created_at);

-- ----------------------------------------------------------------
-- 3) AGENDAMENTOS — só falta o nome do contato
-- ----------------------------------------------------------------
alter table public.agendamentos
  add column if not exists contato_nome text;

create index if not exists agendamentos_empresa_idx on public.agendamentos(empresa_id);
create index if not exists agendamentos_inicio_idx  on public.agendamentos(empresa_id, inicio);

-- ----------------------------------------------------------------
-- 4) FEEDBACKS — já completa (nota, recomendaria, gostou,
--    melhorar, comentario). Apenas índice.
-- ----------------------------------------------------------------
create index if not exists feedbacks_empresa_idx on public.feedbacks(empresa_id);

-- ----------------------------------------------------------------
-- 5) CHAVES_ATIVACAO — geradas no webhook do AbacatePay (tabela nova)
-- ----------------------------------------------------------------
create table if not exists public.chaves_ativacao (
  id uuid primary key default gen_random_uuid(),
  chave text unique not null,
  plano text not null,
  email text,
  billing_id text,
  usada boolean default false,
  usada_em timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
--  RLS — isolamento multi-tenant (cada empresa vê só o seu)
-- ============================================================
alter table public.empresas        enable row level security;
alter table public.chats           enable row level security;
alter table public.agendamentos    enable row level security;
alter table public.feedbacks       enable row level security;
alter table public.chaves_ativacao enable row level security;

-- EMPRESAS: o dono (user_id) gerencia a própria empresa
drop policy if exists empresas_select on public.empresas;
create policy empresas_select on public.empresas
  for select using (user_id = auth.uid());

drop policy if exists empresas_insert on public.empresas;
create policy empresas_insert on public.empresas
  for insert with check (user_id = auth.uid());

drop policy if exists empresas_update on public.empresas;
create policy empresas_update on public.empresas
  for update using (user_id = auth.uid());

-- CHATS / AGENDAMENTOS / FEEDBACKS: escopo pela empresa do usuário
drop policy if exists chats_all on public.chats;
create policy chats_all on public.chats
  for all
  using (empresa_id in (select id from public.empresas where user_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where user_id = auth.uid()));

drop policy if exists agendamentos_all on public.agendamentos;
create policy agendamentos_all on public.agendamentos
  for all
  using (empresa_id in (select id from public.empresas where user_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where user_id = auth.uid()));

drop policy if exists feedbacks_all on public.feedbacks;
create policy feedbacks_all on public.feedbacks
  for all
  using (empresa_id in (select id from public.empresas where user_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where user_id = auth.uid()));

-- CHAVES_ATIVACAO: RLS habilitado + nenhuma policy = nega tudo ao
-- anon/usuário. Só a service_role (webhook / signup server-side) acessa,
-- pois ela ignora RLS por padrão.

-- ============================================================
--  FIM
-- ============================================================
