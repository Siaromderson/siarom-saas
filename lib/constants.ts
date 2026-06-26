// Constantes globais da Siarom AI

export const SITE = {
  name: "Siarom AI",
  description:
    "Alice, a assistente de IA da Siarom, atende e agenda seus clientes no WhatsApp, Instagram e Facebook — 24h por dia, com CRM integrado.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

// WhatsApp para o plano Personalizado e contato
export const WHATSAPP_NUMBER = "5569993959114";

export const WHATSAPP_MESSAGES = {
  personalizado:
    "Olá! Tenho interesse em uma solução PERSONALIZADA da Siarom AI (a partir de R$ 7.000). Pode me explicar como funciona?",
  contato: "Olá! Vim pelo site e gostaria de saber mais sobre a Siarom AI.",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Valor mínimo do plano personalizado (em reais)
export const CUSTOM_PLAN_FROM = 7000;
