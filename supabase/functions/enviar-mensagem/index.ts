// Edge Function: enviar-mensagem
// Dispara uma mensagem de TEXTO para o WhatsApp (via UAZAPI) e persiste a
// mensagem na tabela `mensagens`. Usada pelo CRM (Chat interativo) e pelo n8n.
//
// Arquivo ÚNICO (self-contained) — dá pra colar direto no painel do Supabase.
// Nenhuma credencial hardcoded: tudo vem de Secrets / env.
//
// Secrets necessários (Dashboard → Edge Functions → Secrets):
//   UAZAPI_SERVER_URL   → URL base do servidor UAZAPI
//   CHAT_API_SECRET     → segredo exigido no header x-api-key
//   (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetados automaticamente)
//
// Request:
//   POST /functions/v1/enviar-mensagem
//   Headers: { "Content-Type": "application/json", "x-api-key": "<CHAT_API_SECRET>" }
//   Body: {
//     "chat_id": "uuid",          // opcional — deriva empresa_id + telefone
//     "empresa_id": "uuid",       // obrigatório se não enviar chat_id
//     "telefone": "5511999999999",// obrigatório se não enviar chat_id
//     "texto": "Olá!",            // obrigatório
//     "remetente": "atendente"    // opcional: atendente | alice
//   }

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Secret ausente: ${name}`);
  return v;
}

function adminClient() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Extrai o id da mensagem de formatos comuns de resposta da UAZAPI.
function extrairId(raw: unknown): string | null {
  const j = (raw ?? {}) as Record<string, unknown>;
  const key = j.key as Record<string, unknown> | undefined;
  const id =
    (j.id as string) ??
    (j.messageid as string) ??
    (j.messageId as string) ??
    (key?.id as string) ??
    ((j.message as Record<string, unknown>)?.id as string) ??
    null;
  return typeof id === "string" ? id : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const secret = Deno.env.get("CHAT_API_SECRET");
  if (!secret || req.headers.get("x-api-key") !== secret) {
    return json({ error: "Não autorizado." }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const texto = String(body.texto ?? "").trim();
  if (!texto) return json({ error: "Campo 'texto' é obrigatório." }, 400);

  const remetente =
    body.remetente === "alice" || body.remetente === "atendente"
      ? (body.remetente as string)
      : "atendente";

  try {
    const supabase = adminClient();

    // Resolve empresa + telefone de destino (chat_id é a fonte autoritativa).
    let empresaId = (body.empresa_id as string) ?? null;
    let telefone = (body.telefone as string) ?? null;
    const chatId = (body.chat_id as string) ?? null;

    if (chatId) {
      const { data: chat } = await supabase
        .from("chats")
        .select("empresa_id, telefone")
        .eq("id", chatId)
        .maybeSingle();
      if (!chat) return json({ error: "Chat não encontrado." }, 400);
      empresaId = chat.empresa_id as string;
      telefone = telefone ?? (chat.telefone as string | null);
    }

    if (!empresaId) return json({ error: "Informe empresa_id ou chat_id." }, 400);
    if (!telefone) return json({ error: "Telefone de destino não informado." }, 400);

    const { data: empresa } = await supabase
      .from("empresas")
      .select("id, uazapi_token, uazapi_instance")
      .eq("id", empresaId)
      .maybeSingle();
    if (!empresa) return json({ error: "Empresa não encontrada." }, 400);
    if (!empresa.uazapi_token) {
      return json({ error: "WhatsApp da empresa não conectado." }, 400);
    }

    // registrar_apenas: quem chamou (ex.: n8n do follow-up) JÁ enviou pela UAZAPI
    // e só quer espelhar a mensagem no CRM — não reenviar (evita duplicar).
    const registrarApenas =
      body.registrar_apenas === true || body.somente_registrar === true;

    let wa_message_id: string | null;
    let ok: boolean;
    let raw: unknown;

    if (registrarApenas) {
      wa_message_id = (body.wa_message_id as string | undefined) ?? null;
      ok = body.status !== "erro";
      raw = { registrado: true };
    } else {
      // Envia o texto pela UAZAPI.
      const base = getEnv("UAZAPI_SERVER_URL").replace(/\/+$/, "");
      const numero = String(telefone).replace(/\D/g, "");
      const res = await fetch(`${base}/send/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token: empresa.uazapi_token as string },
        body: JSON.stringify({ number: numero, text: texto }),
      });
      raw = await res.json().catch(() => ({}));
      wa_message_id = extrairId(raw);
      ok = res.ok;
    }

    const statusFinal =
      registrarApenas && typeof body.status === "string"
        ? (body.status as string)
        : ok
          ? "enviada"
          : "erro";

    // Persiste a mensagem (registra mesmo se o provedor falhar).
    const { data: mensagem } = await supabase
      .from("mensagens")
      .insert({
        empresa_id: empresa.id,
        chat_id: chatId,
        direcao: "saida",
        tipo: "texto",
        conteudo: texto,
        remetente,
        wa_message_id,
        status: statusFinal,
      })
      .select("*")
      .single();

    // No modo espelho o n8n cuida do estado do chat; e o follow-up (remetente
    // "alice") nunca deve pausar a IA. Só marca HUMANO quando o atendente envia.
    if (chatId && !registrarApenas) {
      await supabase
        .from("chats")
        .update({
          ultima_interacao: texto.slice(0, 200),
          ...(remetente === "atendente" ? { status: "HUMANO" } : {}),
        })
        .eq("id", chatId);
    }

    if (!ok) {
      return json(
        { ok: false, error: "Falha no envio pela UAZAPI.", provider: raw, mensagem },
        502
      );
    }

    return json({ ok: true, mensagem, wa_message_id, provider: raw });
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});
