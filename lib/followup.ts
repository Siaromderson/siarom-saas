// Tipos, padrões e helpers do Follow-up automático da Siarom.
//
// O follow-up reengaja o lead que parou de responder, em até 3 cadências
// (intervalos configuráveis). Cada cadência pode ter a mensagem gerada pela
// IA (modo "auto") ou escrita pelo usuário (modo "personalizado").

export type Unidade = "minutos" | "horas" | "dias";
export type ModoMensagem = "auto" | "personalizado";

export interface Cadencia {
  ativo: boolean;
  /** quantidade da unidade (ex.: 10) */
  valor: number;
  unidade: Unidade;
  modo: ModoMensagem;
  /** usada quando modo = "personalizado" */
  mensagem: string;
}

export interface FollowupConfig {
  /** liga/desliga o follow-up automático como um todo */
  ativo: boolean;
  /** até 3 cadências */
  cadencias: Cadencia[];
  /** enviar também sábado e domingo (padrão: não) */
  enviar_fim_de_semana: boolean;
  /** janela de envio no formato HH:MM */
  horario_inicio: string;
  horario_fim: string;
}

/** Máximo de cadências configuráveis. */
export const MAX_CADENCIAS = 3;

export const UNIDADES: { id: Unidade; singular: string; plural: string }[] = [
  { id: "minutos", singular: "minuto", plural: "minutos" },
  { id: "horas", singular: "hora", plural: "horas" },
  { id: "dias", singular: "dia", plural: "dias" },
];

// Janela de envio recomendada — fora dela exibimos um aviso (mas não bloqueamos).
export const HORARIO_INICIO_RECOMENDADO = "07:00";
export const HORARIO_FIM_RECOMENDADO = "21:00";

export const CADENCIAS_PADRAO: Cadencia[] = [
  { ativo: true, valor: 10, unidade: "minutos", modo: "auto", mensagem: "" },
  { ativo: true, valor: 2, unidade: "horas", modo: "auto", mensagem: "" },
  { ativo: true, valor: 1, unidade: "dias", modo: "auto", mensagem: "" },
];

export const CONFIG_PADRAO: FollowupConfig = {
  ativo: true,
  cadencias: CADENCIAS_PADRAO.map((c) => ({ ...c })),
  enviar_fim_de_semana: false,
  horario_inicio: HORARIO_INICIO_RECOMENDADO,
  horario_fim: HORARIO_FIM_RECOMENDADO,
};

/** Rótulo amigável do intervalo: "10 minutos", "2 horas", "1 dia". */
export function intervaloLabel(c: Pick<Cadencia, "valor" | "unidade">): string {
  const u = UNIDADES.find((x) => x.id === c.unidade);
  if (!u) return `${c.valor}`;
  return `${c.valor} ${c.valor === 1 ? u.singular : u.plural}`;
}

/** "HH:MM" → minutos desde a meia-noite (NaN se inválido). */
export function horaParaMinutos(hhmm: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm ?? "");
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * A janela de envio está fora do intervalo recomendado (07:00–21:00)?
 * Usado para exibir o aviso na tela — não impede salvar.
 */
export function foraDoRecomendado(inicio: string, fim: string): boolean {
  const i = horaParaMinutos(inicio);
  const f = horaParaMinutos(fim);
  const minRec = horaParaMinutos(HORARIO_INICIO_RECOMENDADO);
  const maxRec = horaParaMinutos(HORARIO_FIM_RECOMENDADO);
  if (Number.isNaN(i) || Number.isNaN(f)) return false;
  return i < minRec || f > maxRec;
}

/**
 * Normaliza/valida um valor vindo do banco (jsonb) para FollowupConfig,
 * preenchendo defaults quando algo estiver ausente ou malformado.
 */
export function normalizarConfig(raw: unknown): FollowupConfig {
  const r = (raw ?? {}) as Record<string, unknown>;

  const cadenciasRaw = Array.isArray(r.cadencias) ? r.cadencias : [];
  const cadencias: Cadencia[] = cadenciasRaw
    .slice(0, MAX_CADENCIAS)
    .map((cRaw, i) => {
      const c = (cRaw ?? {}) as Record<string, unknown>;
      const padrao = CADENCIAS_PADRAO[i] ?? CADENCIAS_PADRAO[0];
      const unidade = (["minutos", "horas", "dias"] as const).includes(
        c.unidade as Unidade
      )
        ? (c.unidade as Unidade)
        : padrao.unidade;
      const valor = Number(c.valor);
      const modo = c.modo === "personalizado" ? "personalizado" : "auto";
      return {
        ativo: c.ativo !== false,
        valor: Number.isFinite(valor) && valor > 0 ? Math.floor(valor) : padrao.valor,
        unidade,
        modo,
        mensagem: typeof c.mensagem === "string" ? c.mensagem : "",
      };
    });

  return {
    ativo: r.ativo !== false,
    cadencias: cadencias.length ? cadencias : CADENCIAS_PADRAO.map((c) => ({ ...c })),
    enviar_fim_de_semana: r.enviar_fim_de_semana === true,
    horario_inicio:
      typeof r.horario_inicio === "string" && /^\d{2}:\d{2}$/.test(r.horario_inicio)
        ? r.horario_inicio
        : HORARIO_INICIO_RECOMENDADO,
    horario_fim:
      typeof r.horario_fim === "string" && /^\d{2}:\d{2}$/.test(r.horario_fim)
        ? r.horario_fim
        : HORARIO_FIM_RECOMENDADO,
  };
}
