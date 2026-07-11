// Chat interativo — tipos e helpers compartilhados.
//
// O CRM conversa pelo WhatsApp direto da tela: cada conversa é um `chat`
// (tabela chats) e cada mensagem trocada é uma linha em `mensagens`.
// O envio real acontece nas Edge Functions (enviar-mensagem / enviar-midia),
// que falam com a API do WhatsApp (UAZAPI) e persistem a mensagem.

export const CHAT_BUCKET = "chat-midias";

/** Limite por arquivo enviado no chat (50 MB). */
export const CHAT_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

/** Tipos aceitos no seletor de arquivo do chat. */
export const CHAT_MEDIA_ACCEPT =
  "image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

export type MensagemDirecao = "entrada" | "saida";
export type MensagemTipo = "texto" | "imagem" | "video" | "documento" | "audio";
export type MensagemRemetente = "contato" | "atendente" | "alice";

export interface Mensagem {
  id: string;
  empresa_id: string;
  chat_id: string | null;
  direcao: MensagemDirecao;
  tipo: MensagemTipo;
  conteudo: string | null;
  media_url: string | null;
  media_mime: string | null;
  media_nome: string | null;
  remetente: MensagemRemetente | string | null;
  wa_message_id: string | null;
  status: string | null;
  created_at: string;
}

/** Classifica a mídia pelo MIME type (para a coluna `tipo`). */
export function tipoMidiaChat(mime: string | null | undefined): MensagemTipo {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return "imagem";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  return "documento";
}

/**
 * Tipo que a UAZAPI espera no envio de mídia.
 *   imagem → image | video → video | audio → audio | documento → document
 */
export function tipoUazapi(tipo: MensagemTipo): "image" | "video" | "audio" | "document" {
  if (tipo === "imagem") return "image";
  if (tipo === "video") return "video";
  if (tipo === "audio") return "audio";
  return "document";
}

/**
 * Caminho do arquivo dentro do bucket, sempre sob o prefixo da empresa
 * (o isolamento por empresa depende disso — as policies de storage validam
 * a primeira "pasta" do caminho).
 */
export function montarChatStoragePath(empresaId: string, nomeArquivo: string): string {
  const limpo = nomeArquivo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-80);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${empresaId}/${Date.now()}-${rnd}-${limpo}`;
}

/** Hora curta HH:mm para a bolha da mensagem. */
export function formatarHora(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
