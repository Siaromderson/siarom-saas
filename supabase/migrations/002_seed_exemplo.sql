-- ============================================================
--  Siarom AI — Dados de EXEMPLO (opcional, para testar o CRM)
--  Rode DEPOIS de criar sua conta no site (assim já existe 1 empresa)
--  e DEPOIS do 001 (precisa da coluna chats.canal).
--  Insere chats e agendamentos na empresa mais recente.
--  Para limpar depois: delete from chats where nome like '[demo]%';
-- ============================================================

do $$
declare
  emp uuid;
begin
  select id into emp from public.empresas order by created_at desc nulls last limit 1;
  if emp is null then
    raise notice 'Nenhuma empresa encontrada. Crie sua conta primeiro.';
    return;
  end if;

  -- Limpa dados demo anteriores (torna o script re-executável)
  delete from public.agendamentos
    where empresa_id = emp and titulo in ('Demonstração do produto', 'Retorno comercial');
  delete from public.chats
    where empresa_id = emp and nome like '[demo]%';

  -- Chats (leads) em várias etapas
  insert into public.chats
    (empresa_id, nome, telefone, canal, etapa, status, sentimento, ultima_interacao, created_at, historico)
  values
    (emp, '[demo] Maria Souza', '5569991110001', 'whatsapp', 'novo_lead', 'novo_lead', 'positivo',
     'Oi, queria saber os preços!', now() - interval '1 hour',
     '[{"autor":"contato","texto":"Oi, queria saber os preços!"},
       {"autor":"alice","texto":"Olá, Maria! Claro, vou te explicar 😊"}]'),
    (emp, '[demo] João Lima', '5569991110002', 'instagram', 'aguardando_humano', 'aguardando_humano', 'neutro',
     'Pode me transferir para um atendente?', now() - interval '3 hour', null),
    (emp, '[demo] Ana Paula', '5569991110003', 'whatsapp', 'agendado', 'agendado', 'positivo',
     'Confirmado para amanhã às 10h!', now() - interval '5 hour', null),
    (emp, '[demo] Carlos Dias', '5569991110004', 'facebook', 'followup_1', 'followup_1', 'neutro',
     'Vou pensar e te retorno.', now() - interval '1 day', null),
    (emp, '[demo] Beatriz Reis', '5569991110005', 'whatsapp', 'followup_2', 'followup_2', 'negativo',
     'Achei caro.', now() - interval '2 day', null),
    (emp, '[demo] Pedro Alves', '5569991110006', 'whatsapp', 'perdido', 'perdido', 'negativo',
     'Não tenho interesse.', now() - interval '3 day', null),
    (emp, '[demo] Lucia Martins', '5569991110007', 'whatsapp', 'finalizado', 'finalizado', 'positivo',
     'Comprei, muito obrigada!', now() - interval '4 day', null),
    -- contato fora do horário comercial (madrugada de hoje)
    (emp, '[demo] Rafael Noite', '5569991110008', 'whatsapp', 'novo_lead', 'novo_lead', 'neutro',
     'Vocês atendem agora?', date_trunc('day', now()) + interval '2 hour', null)
  on conflict (empresa_id, telefone) do nothing;

  -- Agendamentos
  insert into public.agendamentos
    (empresa_id, titulo, contato_nome, descricao, inicio, fim, status, created_at)
  values
    (emp, 'Demonstração do produto', 'Ana Paula', 'Apresentar planos',
       now() + interval '1 day' + interval '10 hour', now() + interval '1 day' + interval '11 hour', 'agendado', now()),
    (emp, 'Retorno comercial', 'Carlos Dias', 'Follow-up de proposta',
       now() + interval '2 day' + interval '14 hour', now() + interval '2 day' + interval '14 hour 30 minute', 'confirmado', now());

  raise notice 'Dados de exemplo inseridos na empresa %', emp;
end $$;
