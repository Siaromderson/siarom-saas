-- ============================================================
--  Siarom AI — Chat interativo (mensagens + storage de mídias)
--  Envio/recebimento de mensagens de WhatsApp direto do CRM.
--  Idempotente: pode rodar mais de uma vez sem erro.
--  Rode no Supabase: SQL Editor → New query → Run.
-- ============================================================

-- ----------------------------------------------------------------
-- 1) BUCKET de mídias do chat (público → gera link usado no envio)
--    Arquivos ficam sob o prefixo {empresa_id}/... (isolamento por
--    empresa garantido pelas policies de storage abaixo).
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('chat-midias', 'chat-midias', true)
on conflict (id) do update set public = true;

-- ----------------------------------------------------------------
-- 2) MENSAGENS — uma linha por mensagem trocada em um chat
--    direcao: entrada (recebida do contato) | saida (enviada pela empresa)
--    tipo:    texto | imagem | video | documento | audio
--    remetente: contato | atendente | alice  (quem originou)
--    wa_message_id: id retornado pela API do WhatsApp (dedupe/rastreio)
--    status: enviada | entregue | lida | recebida | erro
-- ----------------------------------------------------------------
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  chat_id uuid references public.chats(id) on delete cascade,
  direcao text not null default 'saida',            -- entrada | saida
  tipo text not null default 'texto',               -- texto | imagem | video | documento | audio
  conteudo text,                                    -- texto da mensagem ou legenda da mídia
  media_url text,                                   -- link público da mídia (quando houver)
  media_mime text,
  media_nome text,
  remetente text default 'atendente',               -- contato | atendente | alice
  wa_message_id text,                               -- id da mensagem na API do WhatsApp
  status text default 'enviada',                    -- enviada | entregue | lida | recebida | erro
  created_at timestamptz default now()
);

create index if not exists mensagens_empresa_idx      on public.mensagens(empresa_id);
create index if not exists mensagens_chat_idx          on public.mensagens(chat_id, created_at);
create index if not exists mensagens_wa_id_idx         on public.mensagens(wa_message_id);

-- ============================================================
--  RLS — isolamento multi-tenant (cada empresa vê só as suas)
-- ============================================================
alter table public.mensagens enable row level security;

-- Dono: escopo pela empresa do usuário (leitura/escrita via app)
drop policy if exists mensagens_all on public.mensagens;
create policy mensagens_all on public.mensagens
  for all
  using (empresa_id in (select id from public.empresas where user_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where user_id = auth.uid()));

-- Admin: lê todas (para o painel /admin)
drop policy if exists mensagens_admin_select on public.mensagens;
create policy mensagens_admin_select on public.mensagens
  for select using (public.is_admin_user());

-- ----------------------------------------------------------------
-- 3) REALTIME — o chat assina novas mensagens em tempo real.
--    Adiciona a tabela à publicação do Realtime (ignora se já estiver).
-- ----------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.mensagens;
exception
  when duplicate_object then null;   -- já está na publicação
  when undefined_object then null;   -- publicação não existe neste projeto
end$$;

-- ============================================================
--  RLS de STORAGE — arquivos sob o prefixo {empresa_id}/
--  Leitura pública (bucket público → link público funciona);
--  upload/atualização/exclusão exigem ser o dono da empresa.
-- ============================================================

drop policy if exists chat_midias_insert on storage.objects;
create policy chat_midias_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-midias'
    and (storage.foldername(name))[1] in (
      select id::text from public.empresas where user_id = auth.uid()
    )
  );

drop policy if exists chat_midias_update on storage.objects;
create policy chat_midias_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'chat-midias'
    and (storage.foldername(name))[1] in (
      select id::text from public.empresas where user_id = auth.uid()
    )
  );

drop policy if exists chat_midias_delete on storage.objects;
create policy chat_midias_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'chat-midias'
    and (storage.foldername(name))[1] in (
      select id::text from public.empresas where user_id = auth.uid()
    )
  );

drop policy if exists chat_midias_public_read on storage.objects;
create policy chat_midias_public_read on storage.objects
  for select to public
  using (bucket_id = 'chat-midias');

-- ============================================================
--  FIM
-- ============================================================
