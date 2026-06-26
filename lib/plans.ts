// Fonte única da verdade para os planos da Siarom AI.
// Preços em CENTAVOS (formato exigido pelo Stripe).

export interface Plan {
  id: "bronze" | "prata" | "ouro" | "diamante";
  name: string;
  /** Linha curta de posicionamento do plano */
  tagline: string;
  /** Taxa única de implementação, em centavos */
  setupPrice: number;
  /** Mensalidade recorrente, em centavos */
  monthlyPrice: number;
  /** Texto "Tudo do X +" exibido antes da lista de novidades */
  inherits?: string;
  /** Recursos exclusivos/novos deste plano (além do que herda) */
  features: string[];
  /** Diferencial exclusivo do plano, destacado na tabela */
  exclusiveFeature?: string;
  /** Plano em destaque na tabela */
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "bronze",
    name: "Bronze",
    tagline: "Comece a atender no automático",
    setupPrice: 49900,
    monthlyPrice: 12000,
    features: [
      "Agente IA no WhatsApp",
      "Transferência para humano",
      "Análise de sentimentos",
      "Conversas ilimitadas",
    ],
  },
  {
    id: "prata",
    name: "Prata",
    tagline: "Organize e qualifique seus leads",
    setupPrice: 109900,
    monthlyPrice: 21000,
    inherits: "Bronze",
    features: [
      "CRM Siarom",
      "Registro de contatos e histórico",
      "Pipeline + classificação de leads",
    ],
  },
  {
    id: "ouro",
    name: "Ouro",
    tagline: "Agende e faça follow-up no automático",
    setupPrice: 149900,
    monthlyPrice: 35000,
    inherits: "Prata",
    highlight: true,
    features: [
      "Agendamentos automáticos",
      "Lembretes de agendamento",
      "Follow-up automático",
    ],
  },
  {
    id: "diamante",
    name: "Diamante",
    tagline: "Multicanal + marketing ativo",
    setupPrice: 219900,
    monthlyPrice: 52000,
    inherits: "Ouro",
    exclusiveFeature: "Alice envia imagens, documentos e vídeos ativamente",
    features: [
      "Agente IA no Instagram e Facebook",
      "1.000 disparos de Email Marketing",
      "1.000 disparos de WhatsApp Marketing",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Formata centavos para "R$ 1.499" (sem casas decimais quando inteiro) */
export function formatBRL(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}
