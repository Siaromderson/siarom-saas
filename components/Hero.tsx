import Image from "next/image";
import { Sparkles, MessageCircle, Check, CalendarCheck } from "lucide-react";
import { whatsappLink, WHATSAPP_MESSAGES } from "@/lib/constants";
import AliceAvatar from "@/components/AliceAvatar";

export default function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        {/* Texto */}
        <div className="animate-fade-up">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Conheça a Alice, sua assistente de IA
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
            A <span className="gradient-text">Alice</span> atende e agenda seus clientes 24h por dia.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-600">
            A <strong className="text-slate-900">Alice</strong> é a assistente de IA da Siarom:
            responde no WhatsApp, Instagram e Facebook, tira dúvidas, marca agendamentos e
            organiza tudo no CRM — com transferência para um humano sempre que você quiser.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#planos" className="btn-primary text-base">
              Ver planos e preços
            </a>
            <a
              href={whatsappLink(WHATSAPP_MESSAGES.contato)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-base"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            {["Atendimento ilimitado", "Agendamentos automáticos", "Configuração guiada"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Alice + cartões flutuantes */}
        <div className="animate-fade-up [animation-delay:120ms]">
          <div className="relative mx-auto max-w-md">
            {/* brilho de fundo */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient opacity-15 blur-3xl" />

            {/* Alice */}
            <div className="relative mx-auto flex justify-center">
              <Image
                src="/imagens/alice-full.png"
                alt="Alice — assistente de IA da Siarom"
                width={420}
                height={620}
                priority
                className="h-[440px] w-auto object-contain drop-shadow-xl sm:h-[520px]"
              />
            </div>

            {/* Cartão de conversa flutuante */}
            <div className="absolute -left-2 bottom-6 w-60 animate-float rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:-left-6">
              <div className="flex items-center gap-2.5">
                <AliceAvatar size={34} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Alice</p>
                  <p className="flex items-center gap-1.5 text-xs text-accent-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                    online agora
                  </p>
                </div>
              </div>
              <p className="mt-2.5 rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2 text-xs text-slate-700">
                Oi! Quer agendar um horário? Tenho hoje às 14h ou 16h 😊
              </p>
            </div>

            {/* Badge agendamento flutuante */}
            <div className="absolute -right-1 top-8 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur sm:-right-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-500/15 text-accent-600">
                <CalendarCheck className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-900">Agendado ✓</p>
                <p className="text-[11px] text-slate-500">Hoje, 14:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
