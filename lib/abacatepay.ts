// Cliente AbacatePay (servidor) — gateway de pagamento Pix/cartão.
// A chave fica só no servidor (nunca exposta ao navegador).
// Docs: https://docs.abacatepay.com

const API_URL = "https://api.abacatepay.com/v1";

function getApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) {
    throw new Error(
      "ABACATEPAY_API_KEY não configurada. Adicione no .env.local (ou nas variáveis da Vercel)."
    );
  }
  return key;
}

export interface BillingProduct {
  /** Identificador interno do produto (usado para reconhecer o plano no webhook) */
  externalId: string;
  name: string;
  quantity: number;
  /** Preço em CENTAVOS */
  price: number;
}

export interface BillingCustomer {
  name?: string;
  email?: string;
  cellphone?: string;
  /** CPF/CNPJ (apenas dígitos) */
  taxId?: string;
}

export interface CreateBillingInput {
  products: BillingProduct[];
  returnUrl: string;
  completionUrl: string;
  customer?: BillingCustomer;
  /** ONE_TIME = cobrança única (usado para a taxa de implementação) */
  frequency?: "ONE_TIME" | "MULTIPLE_PAYMENTS";
  /** Métodos aceitos. AbacatePay habilita cartão conforme a conta; Pix é padrão. */
  methods?: Array<"PIX" | "CARD">;
}

export interface Billing {
  id: string;
  url: string;
  status: string;
  amount?: number;
}

/** Cria uma cobrança hospedada e retorna a URL de pagamento. */
export async function createBilling(input: CreateBillingInput): Promise<Billing> {
  const res = await fetch(`${API_URL}/billing/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      frequency: input.frequency ?? "ONE_TIME",
      methods: input.methods ?? ["PIX"],
      products: input.products,
      returnUrl: input.returnUrl,
      completionUrl: input.completionUrl,
      ...(input.customer ? { customer: input.customer } : {}),
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new Error(
      json?.error || `AbacatePay respondeu ${res.status} ao criar a cobrança.`
    );
  }
  return json.data as Billing;
}
