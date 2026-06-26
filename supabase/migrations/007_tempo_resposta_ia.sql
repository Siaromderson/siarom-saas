-- ============================================================
--  Siarom AI — Tempo de resposta da IA (Alice)
--  Idempotente: pode rodar mais de uma vez sem erro.
--  Usado na aba "Dados da empresa" das Configurações.
--  Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- Tempo (em segundos) que a Alice aguarda antes de responder.
-- Quanto maior, melhor ela interpreta múltiplos áudios/textos seguidos.
-- Faixa permitida: 10 a 60 segundos. Padrão: 20.
alter table public.empresas
  add column if not exists tempo_resposta_ia integer not null default 20;

alter table public.empresas
  drop constraint if exists empresas_tempo_resposta_ia_range;

alter table public.empresas
  add constraint empresas_tempo_resposta_ia_range
  check (tempo_resposta_ia between 10 and 60);

-- ============================================================
--  FIM
-- ============================================================
