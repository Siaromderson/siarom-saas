"use server";

import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import {
  CHAT_BUCKET,
  tipoMidiaChat,
  type Mensagem,
  type MensagemTipo,
} from "@/lib/chat";

export interface EnvioResult {
  error?: string;
  ok?: boolean;
  mensagem?: Mensagem;
}

const SEM_ACESSO = "Chat interativo disponível a partir do plano Prata.";

/**
 * Chama uma Edge Function do chat (enviar-mensagem / enviar-midia) via HTTPS,
 * autenticando com o segredo compartilhado (CHAT_API_SECRET). É o MESMO
 * endpoint que o fluxo n8n usa — o app é só mais um cliente da função.
 */
async function chamarEdge(
  nome: "enviar-mensagem" | "enviar-midia",
  body: Record<string, unknown>
): Promise<{ status: number; json: Record<string, unknown> }> {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const secret = process.env.CHAT_API_SECRET || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
  if (!secret) throw new Error("CHAT_API_SECRET não configurada no servidor.");

  const res = await fetch(`${base}/functions/v1/${nome}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secret,
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, json };
}

/** Confere que o chat pertence à empresa e devolve o telefone dele. */
async function chatDaEmpresa(chatId: string, empresaId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chats")
    .select("id, telefone")
    .eq("id", chatId)
    .eq("empresa_id", empresaId)
    .maybeSingle();
  return data as { id: string; telefone: string | null } | null;
}

/** Envia uma mensagem de texto para o contato de um chat. */
export async function enviarMensagem(
  chatId: string,
  texto: string
): Promise<EnvioResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };
  if (!temAcesso(empresa, "chat")) return { error: SEM_ACESSO };

  const conteudo = String(texto || "").trim();
  if (!conteudo) return { error: "Digite uma mensagem." };

  const chat = await chatDaEmpresa(chatId, empresa.id);
  if (!chat) return { error: "Conversa não encontrada." };

  try {
    const { status, json } = await chamarEdge("enviar-mensagem", {
      chat_id: chatId,
      empresa_id: empresa.id,
      telefone: chat.telefone,
      texto: conteudo,
      remetente: "atendente",
    });
    if (status !== 200 || !json.ok) {
      return {
        error: (json.error as string) || "Não foi possível enviar a mensagem.",
        mensagem: json.mensagem as Mensagem | undefined,
      };
    }
    return { ok: true, mensagem: json.mensagem as Mensagem };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Envia uma mídia já enviada ao Storage (bucket chat-midias). O upload do
 * arquivo é feito no navegador; aqui validamos o caminho, geramos a URL
 * pública e disparamos a Edge Function enviar-midia.
 */
export async function enviarMidiaChat(input: {
  chatId: string;
  storage_path: string;
  mime_type: string;
  nome: string;
  legenda?: string;
}): Promise<EnvioResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };
  if (!temAcesso(empresa, "chat")) return { error: SEM_ACESSO };

  // O caminho precisa estar sob o prefixo da própria empresa.
  if (!input.storage_path.startsWith(`${empresa.id}/`)) {
    return { error: "Caminho de arquivo inválido." };
  }

  const chat = await chatDaEmpresa(input.chatId, empresa.id);
  if (!chat) return { error: "Conversa não encontrada." };

  const supabase = await createClient();
  const { data: pub } = supabase.storage
    .from(CHAT_BUCKET)
    .getPublicUrl(input.storage_path);

  const tipo: MensagemTipo = tipoMidiaChat(input.mime_type);

  try {
    const { status, json } = await chamarEdge("enviar-midia", {
      chat_id: input.chatId,
      empresa_id: empresa.id,
      telefone: chat.telefone,
      url: pub.publicUrl,
      tipo,
      legenda: input.legenda || "",
      nome: input.nome,
      remetente: "atendente",
    });
    if (status !== 200 || !json.ok) {
      // Remove o arquivo órfão se o envio falhou por completo.
      if (!json.mensagem) {
        await supabase.storage.from(CHAT_BUCKET).remove([input.storage_path]);
      }
      return {
        error: (json.error as string) || "Não foi possível enviar a mídia.",
        mensagem: json.mensagem as Mensagem | undefined,
      };
    }
    return { ok: true, mensagem: json.mensagem as Mensagem };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Carrega as mensagens de um chat (ordem cronológica), respeitando o RLS. */
export async function carregarMensagens(chatId: string): Promise<Mensagem[]> {
  const empresa = await getEmpresaAtual();
  if (!empresa || !temAcesso(empresa, "chat")) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("mensagens")
    .select("*")
    .eq("empresa_id", empresa.id)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return (data ?? []) as Mensagem[];
}
