// Controle de acesso por plano — "as sessões dos planos da Siarom".
// Cada seção do CRM exige um plano mínimo. Clientes em planos inferiores
// veem a seção com cadeado e um convite para fazer upgrade.
//
// O admin pode liberar seções individuais para um cliente específico
// (coluna empresas.recursos_liberados — array de SectionId), o que
// sobrepõe a regra do plano.

export type PlanoId = "bronze" | "prata" | "ouro" | "diamante";

// Hierarquia dos planos (maior = mais recursos)
export const PLANO_RANK: Record<PlanoId, number> = {
  bronze: 1,
  prata: 2,
  ouro: 3,
  diamante: 4,
};

export type SectionId =
  | "dashboard"
  | "kanban"
  | "contatos"
  | "followup"
  | "agenda"
  | "marketing"
  | "configuracoes"
  | "midias";

export interface SectionDef {
  id: SectionId;
  label: string;
  href: string;
  /** Plano mínimo necessário para acessar */
  minPlano: PlanoId;
  /** Mensagem curta exibida no cadeado */
  descricao: string;
}

// Mapa fiel aos planos atuais (lib/plans.ts):
//  Bronze   → atendimento básico (Dashboard + Configurações/WhatsApp)
//  Prata    → CRM completo (Kanban, Contatos, Agenda)
//  Ouro     → agendamentos automáticos, lembretes e follow-up (automação)
//  Diamante → Multicanal (Instagram/Facebook) + Marketing
export const SECTIONS: Record<SectionId, SectionDef> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    href: "/crm",
    minPlano: "bronze",
    descricao: "Visão geral do atendimento.",
  },
  configuracoes: {
    id: "configuracoes",
    label: "Configurações",
    href: "/crm/configuracoes",
    minPlano: "bronze",
    descricao: "Dados da empresa, Alice e conexão do WhatsApp.",
  },
  kanban: {
    id: "kanban",
    label: "Kanban",
    href: "/crm/kanban",
    minPlano: "prata",
    descricao: "Pipeline visual de leads, arrastando entre etapas.",
  },
  contatos: {
    id: "contatos",
    label: "Contatos",
    href: "/crm/contatos",
    minPlano: "prata",
    descricao: "Lista de leads e histórico completo das conversas.",
  },
  followup: {
    id: "followup",
    label: "Follow-up",
    href: "/crm/followup",
    minPlano: "ouro",
    descricao: "Cadências automáticas para reengajar leads que pararam de responder.",
  },
  agenda: {
    id: "agenda",
    label: "Agenda",
    href: "/crm/agenda",
    minPlano: "prata",
    descricao: "Calendário de agendamentos em dia, semana e mês.",
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    href: "/crm/marketing",
    minPlano: "diamante",
    descricao: "Disparos de Email e WhatsApp Marketing e canais Instagram/Facebook.",
  },
  midias: {
    id: "midias",
    label: "Mídias",
    href: "/crm/midias",
    minPlano: "diamante",
    descricao:
      "Galeria de imagens, vídeos e documentos que a Alice envia automaticamente nas conversas.",
  },
};

// Ordem de exibição no menu lateral
export const SECTION_ORDER: SectionId[] = [
  "dashboard",
  "kanban",
  "contatos",
  "followup",
  "agenda",
  "marketing",
  "configuracoes",
  "midias",
];

function rankDoPlano(plano: string | null | undefined): number {
  return PLANO_RANK[(plano as PlanoId) ?? "bronze"] ?? 1;
}

/** Plano mínimo que destrava a seção (objeto do plano, p/ nome/label). */
export function planoNecessario(sectionId: SectionId): PlanoId {
  return SECTIONS[sectionId].minPlano;
}

/**
 * O cliente tem acesso à seção?
 * Considera (1) o plano e (2) liberações manuais feitas pelo admin.
 */
export function temAcesso(
  empresa: { plano?: string | null; recursos_liberados?: unknown },
  sectionId: SectionId
): boolean {
  const sec = SECTIONS[sectionId];
  if (!sec) return true;

  const extras = Array.isArray(empresa?.recursos_liberados)
    ? (empresa.recursos_liberados as string[])
    : [];
  if (extras.includes(sectionId)) return true;

  return rankDoPlano(empresa?.plano) >= PLANO_RANK[sec.minPlano];
}
