// Tipos e constantes compartilhados do CRM Siarom.

export type Etapa =
  | "novo_lead"
  | "aguardando_humano"
  | "agendado"
  | "followup_1"
  | "followup_2"
  | "perdido"
  | "finalizado";

export interface EtapaDef {
  id: Etapa;
  label: string;
  /** classes de cor para a barra/topo da coluna e badges */
  dot: string;
}

// Ordem = ordem das colunas no Kanban
export const ETAPAS: EtapaDef[] = [
  { id: "novo_lead", label: "Novo Lead", dot: "bg-brand-400" },
  { id: "aguardando_humano", label: "Aguardando Humano", dot: "bg-amber-400" },
  { id: "agendado", label: "Agendado", dot: "bg-sky-400" },
  { id: "followup_1", label: "Follow-up 1", dot: "bg-accent-400" },
  { id: "followup_2", label: "Follow-up 2", dot: "bg-accent-500" },
  { id: "perdido", label: "Perdido", dot: "bg-red-400" },
  { id: "finalizado", label: "Finalizado", dot: "bg-emerald-500" },
];

export const ETAPA_LABEL: Record<string, string> = Object.fromEntries(
  ETAPAS.map((e) => [e.id, e.label])
);

export type Sentimento = "positivo" | "neutro" | "negativo";

export const SENTIMENTO_DEF: Record<
  Sentimento,
  { label: string; cls: string; emoji: string; bar: string }
> = {
  positivo: {
    label: "Positivo",
    cls: "text-accent-600 bg-accent-500/15",
    emoji: "😊",
    bar: "bg-accent-500",
  },
  neutro: {
    label: "Neutro",
    cls: "text-slate-600 bg-slate-200/70",
    emoji: "😐",
    bar: "bg-slate-400",
  },
  negativo: {
    label: "Negativo",
    cls: "text-red-600 bg-red-100",
    emoji: "😟",
    bar: "bg-red-400",
  },
};

export const CANAL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
};

// Registro de um chat/lead (colunas reais da tabela `chats`)
export interface Chat {
  id: string;
  empresa_id: string;
  nome: string | null;
  telefone: string | null;
  canal: string | null;
  etapa: Etapa | null;
  status: string | null;
  sentimento: Sentimento | null;
  followup: string | null;
  /** texto livre: última mensagem ou data/hora da última interação */
  ultima_interacao: string | null;
  /** histórico da conversa em TEXT (pode ser JSON serializado ou texto puro) */
  historico: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface Agendamento {
  id: string;
  empresa_id: string;
  chat_id: string | null;
  titulo: string | null;
  descricao: string | null;
  contato_nome: string | null;
  inicio: string;
  fim: string | null;
  status: string | null;
  created_at: string;
}

/** Horário comercial: 7h–18h. Fora disso conta como "fora do horário". */
export function foraDoHorario(iso: string): boolean {
  const h = new Date(iso).getHours();
  return h >= 18 || h < 7;
}

/** Data relativa amigável: "agora", "há 12 min", "ontem", "12 jun". */
export function formatarDataRelativa(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 0) {
    // datas futuras → mostra a data curta
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Data/hora no padrão DD/MM/YYYY HH:mm (sem segundos nem timezone). */
export function formatarDataCurta(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const data = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} ${hora}`;
}

/** Data/hora completa para tooltip (ex.: "26/06/2026 às 14:30"). */
export function formatarDataCompleta(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
