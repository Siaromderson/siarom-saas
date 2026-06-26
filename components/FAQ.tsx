"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Como funciona a cobrança?",
    a: "Você paga uma taxa única de implementação (varia por plano) e uma mensalidade recorrente. O pagamento é via Pix ou cartão (AbacatePay), e a mensalidade se renova automaticamente. Não há fidelidade — cancele quando quiser.",
  },
  {
    q: "Preciso saber configurar alguma coisa?",
    a: "Não. Na primeira vez que você entra, a própria Alice te guia passo a passo: conecta o WhatsApp, configura o atendimento e apresenta o CRM. Você pode seguir o guia, pular etapas ou fechar quando quiser.",
  },
  {
    q: "Em quanto tempo fica no ar?",
    a: "Assim que o pagamento é confirmado, você recebe a chave de ativação por email e já pode acessar o CRM Siarom para conectar seu WhatsApp e começar a atender.",
  },
  {
    q: "A Alice marca agendamentos sozinha?",
    a: "Sim. A Alice entende o pedido do cliente, oferece horários e registra o agendamento direto na Agenda do CRM — e você acompanha tudo em tempo real.",
  },
  {
    q: "A IA consegue transferir para um atendente humano?",
    a: "Sim. Em todos os planos a IA identifica quando é melhor passar a conversa para um humano e faz a transferência automaticamente, sem perder o histórico.",
  },
  {
    q: "Funciona no Instagram e no Facebook também?",
    a: "Sim, a partir do plano Ouro a Alice atende também no Instagram e no Facebook, além do WhatsApp.",
  },
  {
    q: "E se eu precisar de algo sob medida?",
    a: "Temos o plano Personalizado, com implementação a partir de R$ 7.000, para integrações e fluxos específicos do seu negócio. Fale com a gente no WhatsApp.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">Dúvidas frequentes</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Perguntas <span className="gradient-text">frequentes</span>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-slate-900">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-600 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
