-- ============================================================
--  Siarom AI — Produtos/Serviços estruturados da empresa
--  Idempotente: pode rodar mais de uma vez sem erro.
--  Usado na aba "Dados da empresa" das Configurações.
--  Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- Cada item: { "nome": "Corte de cabelo", "valor": "R$ 50" }
-- (o campo texto produtos_servicos continua existindo para notas livres)
alter table public.empresas
  add column if not exists servicos jsonb default '[]'::jsonb;

-- ============================================================
--  FIM
-- ============================================================
