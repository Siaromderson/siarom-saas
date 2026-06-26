import { NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import { generateActivationKey } from "@/lib/activation";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendActivationEmail } from "@/lib/email";

export const runtime = "nodejs";

// Webhook do AbacatePay. Configure em https://app.abacatepay.com (Webhooks)
// apontando para:  https://SEU_DOMINIO/api/webhook?webhookSecret=SEU_SECRET
// e cole o mesmo segredo em ABACATEPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  // 1) Valida o segredo (via query string, como o AbacatePay envia)
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  const url = new URL(req.url);
  if (!secret || url.searchParams.get("webhookSecret") !== secret) {
    return NextResponse.json({ error: "Segredo inválido." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const event: string = payload?.event ?? "";
  const isPaid =
    event === "billing.paid" ||
    event === "checkout.completed" ||
    payload?.data?.billing?.status === "PAID";

  if (!isPaid) {
    return NextResponse.json({ received: true });
  }

  // 2) Extrai plano (via externalId do produto) e email do cliente
  const billing = payload?.data?.billing ?? payload?.data ?? {};
  const products: any[] = billing?.products ?? [];
  const externalId: string = products[0]?.externalId ?? "";
  const planId = externalId.replace(/^impl-/, "");
  const plan = getPlan(planId);

  const email: string | undefined =
    billing?.customer?.metadata?.email ??
    billing?.customer?.email ??
    payload?.data?.customer?.email;

  console.log(`✅ Pagamento confirmado | plano=${planId} | email=${email}`);

  if (!plan || !email) {
    // Sem dados suficientes para ativar — registra e responde 200 (não reprocessar)
    console.warn("Webhook pago sem plano/email reconhecíveis.");
    return NextResponse.json({ received: true });
  }

  // 3) Gera e persiste a chave de ativação
  const key = generateActivationKey();
  try {
    const admin = createAdminClient();
    await admin.from("chaves_ativacao").insert({
      chave: key,
      plano: plan.id,
      email,
      billing_id: billing?.id ?? null,
      usada: false,
    });
  } catch (e) {
    console.error("Erro ao salvar chave de ativação:", e);
  }

  // 4) Envia a chave por email
  try {
    await sendActivationEmail(email, key, plan.name);
  } catch (e) {
    console.error("Erro ao enviar email de ativação:", e);
  }

  return NextResponse.json({ received: true });
}
