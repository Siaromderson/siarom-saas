// Mídias da empresa — galeria de arquivos (imagem, vídeo, documento) que a
// Alice pode enviar automaticamente no WhatsApp.
//
// Cada mídia tem uma regra de envio:
//   inicio_conversa → enviada logo no começo da conversa (ex.: vídeo institucional)
//   ao_oferecer     → enviada quando a Alice oferece um produto/serviço específico
//                     (vínculo por nome com empresas.servicos[].nome)
//
// Recurso exclusivo do plano Diamante.

export const MIDIAS_BUCKET = "midias";

/** Limite por arquivo (50 MB) — vídeos institucionais costumam caber bem. */
export const MIDIA_MAX_BYTES = 50 * 1024 * 1024;

/** Tipos aceitos no seletor de arquivo. */
export const MIDIA_ACCEPT =
  "image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

export type MidiaTipo = "imagem" | "video" | "documento";
export type MidiaMomento = "inicio_conversa" | "ao_oferecer";

export interface Midia {
  id: string;
  empresa_id: string;
  nome: string;
  tipo: MidiaTipo;
  mime_type: string | null;
  tamanho: number | null;
  storage_path: string;
  url_publica: string;
  momento: MidiaMomento;
  servico_nome: string | null;
  created_at: string;
}

/** Classifica o arquivo pelo MIME type. */
export function tipoDoMime(mime: string | null | undefined): MidiaTipo {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return "imagem";
  if (m.startsWith("video/")) return "video";
  return "documento";
}

const MOMENTOS: MidiaMomento[] = ["inicio_conversa", "ao_oferecer"];

/** Normaliza o momento vindo do cliente (nunca confiar no payload). */
export function normalizarMomento(v: unknown): MidiaMomento {
  return MOMENTOS.includes(v as MidiaMomento) ? (v as MidiaMomento) : "inicio_conversa";
}

export const MOMENTO_LABEL: Record<MidiaMomento, string> = {
  inicio_conversa: "Início da conversa",
  ao_oferecer: "Ao oferecer um produto/serviço",
};

export const TIPO_LABEL: Record<MidiaTipo, string> = {
  imagem: "Imagem",
  video: "Vídeo",
  documento: "Documento",
};

/** Tamanho legível (KB/MB) a partir dos bytes. */
export function formatarTamanho(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Caminho do arquivo dentro do bucket, sempre sob o prefixo da empresa
 * (o isolamento por empresa depende disso — as policies de storage validam
 * a primeira "pasta" do caminho).
 */
export function montarStoragePath(empresaId: string, nomeArquivo: string): string {
  const limpo = nomeArquivo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-80);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${empresaId}/${Date.now()}-${rnd}-${limpo}`;
}
