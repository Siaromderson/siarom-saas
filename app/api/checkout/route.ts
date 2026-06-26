import { NextResponse } from "next/server";
import { createBilling } from "@/lib/abacatepay";
import { getPlan } from "@/lib/plans";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

// Cria a cobrança da TAXA DE IMPLEMENTAÇÃO (cobrança única via AbacatePay).
// A mensalidade recorrente é gerida à parte por link automático (n8n + AbacatePay),
// disparado após a confirmação do pagamento e o cadastro do cliente.
export async function POST(req: Request) {
  try {
    const { planId, customer } = (await req.json()) as {
      planId?: string;
      customer?: { name?: string; email?: string; cellphone?: string; taxId?: string };
    };

    const plan = planId ? getPlan(planId) : undefined;
    if (!plan) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const billing = await createBilling({
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: [
        {
          // externalId carrega o plano para o webhook reconhecer a compra
          externalId: `impl-${plan.id}`,
          name: `Siarom AI — Implementação (Plano ${plan.name})`,
          quantity: 1,
          price: plan.setupPrice,
        },
      ],
      customer,
      completionUrl: `${SITE.url}/sucesso?plano=${plan.id}`,
      returnUrl: `${SITE.url}/#planos`,
    });

    return NextResponse.json({ url: billing.url });
  } catch (e) {
    console.error("Erro no checkout:", e);
    const msg = e instanceof Error ? e.message : "Erro ao criar o checkout.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
