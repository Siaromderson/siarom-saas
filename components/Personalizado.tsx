import { MessageCircle, Wrench } from "lucide-react";
import { whatsappLink, WHATSAPP_MESSAGES, CUSTOM_PLAN_FROM } from "@/lib/constants";

export default function Personalizado() {
  const fromValue = CUSTOM_PLAN_FROM.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

  return (
    <section id="personalizado" className="py-12 lg:py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-gradient opacity-10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                <Wrench className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold text-slate-900">
                Precisa de algo <span className="gradient-text">sob medida?</span>
              </h2>
              <p className="mt-3 max-w-xl text-slate-600">
                Integrações específicas, fluxos de atendimento avançados, múltiplos canais e
                automações exclusivas para o seu negócio. Montamos uma solução personalizada de
                ponta a ponta.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Implementação a partir de <span className="font-semibold text-slate-900">{fromValue}</span>.
              </p>
            </div>

            <a
              href={whatsappLink(WHATSAPP_MESSAGES.personalizado)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp shrink-0 text-base"
            >
              <MessageCircle className="h-5 w-5" />
              Falar com especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
