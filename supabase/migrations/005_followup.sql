-- ============================================================
--  Siarom AI — Follow-up (cadências, regras de envio e mensagens)
--  Uma configuração por empresa. Idempotente: pode rodar mais de
--  uma vez sem erro.
--  Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) FOLLOWUP_CONFIG — preferências de follow-up automático
--    cadencias: array (máx. 3) de
--      { ativo, valor, unidade(minutos|horas|dias), modo(auto|personalizado), mensagem }
--    Padrão: 10 minutos · 2 horas · 1 dia
-- ----------------------------------------------------------------
create table if not exists public.followup_config (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  ativo boolean not null default true,
  cadencias jsonb not null default '[
    {"ativo": true, "valor": 10, "unidade": "minutos", "modo": "auto", "mensagem": ""},
    {"ativo": true, "valor": 2,  "unidade": "horas",   "modo": "auto", "mensagem": ""},
    {"ativo": true, "valor": 1,  "unidade": "dias",    "modo": "auto", "mensagem": ""}
  ]'::jsonb,
  enviar_fim_de_semana boolean not null default false,
  horario_inicio text not null default '07:00',   -- HH:MM
  horario_fim    text not null default '21:00',   -- HH:MM (recomendado não passar de 21:00)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Uma configuração por empresa (permite upsert por empresa_id).
create unique index if not exists followup_config_empresa_key
  on public.followup_config(empresa_id);

-- ============================================================
--  RLS — isolamento multi-tenant (cada empresa vê só a sua)
-- ============================================================
alter table public.followup_config enable row level security;

-- Dono: escopo pela empresa do usuário
drop policy if exists followup_config_all on public.followup_config;
create policy followup_config_all on public.followup_config
  for all
  using (empresa_id in (select id from public.empresas where user_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where user_id = auth.uid()));

-- Admin: lê todas (para o painel /admin)
drop policy if exists followup_config_admin_select on public.followup_config;
create policy followup_config_admin_select on public.followup_config
  for select using (public.is_admin_user());

-- ============================================================
--  FIM
-- ============================================================
