-- ============================================================
--  Siarom AI — Mídias da empresa (galeria + regras de envio)
--  Recurso exclusivo do plano Diamante.
--  Idempotente: pode rodar mais de uma vez sem erro.
--  Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) BUCKET de armazenamento (público para gerar o link de cada mídia)
--    Os arquivos ficam sob o prefixo {empresa_id}/... (isolamento por
--    empresa garantido pelas policies de storage abaixo).
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('midias', 'midias', true)
on conflict (id) do update set public = true;

-- ----------------------------------------------------------------
-- 2) MIDIAS — uma linha por arquivo enviado
--    tipo:    imagem | video | documento
--    momento: inicio_conversa  → enviada no começo da conversa
--             ao_oferecer       → enviada ao oferecer um produto/serviço
--    servico_nome: produto/serviço vinculado (apenas quando momento =
--             ao_oferecer); casa com empresas.servicos[].nome
-- ----------------------------------------------------------------
create table if not exists public.midias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  tipo text not null default 'documento',          -- imagem | video | documento
  mime_type text,
  tamanho bigint,                                   -- bytes
  storage_path text not null,                       -- caminho dentro do bucket
  url_publica text not null,                        -- link público gerado no upload
  momento text not null default 'inicio_conversa',  -- inicio_conversa | ao_oferecer
  servico_nome text,                                -- produto/serviço vinculado
  created_at timestamptz default now()
);

create index if not exists midias_empresa_idx on public.midias(empresa_id);
create index if not exists midias_empresa_momento_idx on public.midias(empresa_id, momento);

-- ============================================================
--  RLS — isolamento multi-tenant (cada empresa vê só as suas)
-- ============================================================
alter table public.midias enable row level security;

-- Dono: escopo pela empresa do usuário
drop policy if exists midias_all on public.midias;
create policy midias_all on public.midias
  for all
  using (empresa_id in (select id from public.empresas where user_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where user_id = auth.uid()));

-- Admin: lê todas (para o painel /admin)
drop policy if exists midias_admin_select on public.midias;
create policy midias_admin_select on public.midias
  for select using (public.is_admin_user());

-- ============================================================
--  RLS de STORAGE — arquivos sob o prefixo {empresa_id}/
--  Leitura é pública (bucket público → link público funciona);
--  upload/atualização/exclusão exigem ser o dono da empresa.
-- ============================================================

-- Upload (insert) somente na "pasta" da própria empresa
drop policy if exists midias_storage_insert on storage.objects;
create policy midias_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'midias'
    and (storage.foldername(name))[1] in (
      select id::text from public.empresas where user_id = auth.uid()
    )
  );

-- Atualização dos próprios arquivos
drop policy if exists midias_storage_update on storage.objects;
create policy midias_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'midias'
    and (storage.foldername(name))[1] in (
      select id::text from public.empresas where user_id = auth.uid()
    )
  );

-- Exclusão dos próprios arquivos
drop policy if exists midias_storage_delete on storage.objects;
create policy midias_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'midias'
    and (storage.foldername(name))[1] in (
      select id::text from public.empresas where user_id = auth.uid()
    )
  );

-- Leitura pública dos arquivos do bucket (necessária para o link público)
drop policy if exists midias_storage_public_read on storage.objects;
create policy midias_storage_public_read on storage.objects
  for select to public
  using (bucket_id = 'midias');

-- ============================================================
--  FIM
-- ============================================================
