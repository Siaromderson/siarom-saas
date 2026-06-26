import { SITE } from "@/lib/constants";

// Envio de email transacional via Resend (https://resend.com).
// Se RESEND_API_KEY não estiver configurada, apenas registra no log
// (útil em desenvolvimento — o pagamento continua funcionando).

export async function sendActivationEmail(to: string, key: string, planName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Siarom AI <nao-responder@siarom.ai>";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#0c1a13">
      <h2 style="color:#14573d">Bem-vindo à Siarom AI 🎉</h2>
      <p>Seu pagamento do plano <b>${planName}</b> foi confirmado.</p>
      <p>Use a chave abaixo para ativar sua conta no CRM:</p>
      <p style="font-size:20px;font-weight:700;letter-spacing:1px;background:#edf7f1;
                border:1px solid #a8d8c0;border-radius:12px;padding:14px;text-align:center;color:#0c4630">
        ${key}
      </p>
      <p style="margin-top:24px">
        <a href="${SITE.url}/cadastro?chave=${encodeURIComponent(key)}"
           style="background:#1f6a4b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">
          Ativar minha conta
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;margin-top:24px">
        Se você não fez esta compra, ignore este email.
      </p>
    </div>`;

  if (!apiKey) {
    console.log(`[email:DEV] Chave de ativação para ${to} (${planName}): ${key}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Sua chave de ativação — Siarom AI",
      html,
    }),
  });
  if (!res.ok) {
    console.error("Falha ao enviar email:", await res.text());
  }
}
