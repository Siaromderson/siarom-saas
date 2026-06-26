-- ============================================================
--  Siarom AI — Correção: permitir criar a empresa no cadastro
--  Idempotente. Rode no Supabase: SQL Editor → New query → Run.
--
--  Causa do erro "Conta criada, mas houve um erro ao configurar
--  a empresa.": a coluna empresas.nome_empresa estava NOT NULL,
--  mas o cadastro cria a empresa ANTES do onboarding (que é quem
--  preenche o nome). O insert sem nome_empresa era rejeitado
--  (Postgres 23502: null value violates not-null constraint).
--
--  Solução: nome_empresa passa a ser opcional; é preenchido no
--  onboarding (app/onboarding/actions.ts).
-- ============================================================

alter table public.empresas
  alter column nome_empresa drop not null;

-- ============================================================
--  FIM
-- ============================================================
