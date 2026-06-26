import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { whatsappLink, WHATSAPP_MESSAGES, WHATSAPP_NUMBER } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();
  const phoneDisplay = WHATSAPP_NUMBER.replace(
    /^(\d{2})(\d{2})(\d{5})(\d{4})$/,
    "+$1 ($2) $3-$4"
  );

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-x py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-900">
              <Image
                src="/imagens/logo.png"
                alt="Siarom AI"
                width={64}
                height={36}
                className="h-9 w-auto"
              />
              Siarom <span className="gradient-text">AI</span>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Assistente de IA para atender e agendar seus clientes no WhatsApp,
              Instagram e Facebook — com CRM integrado.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-slate-900">Navegação</p>
            <a href="#como-funciona" className="text-slate-500 hover:text-slate-900">Como funciona</a>
            <a href="#planos" className="text-slate-500 hover:text-slate-900">Planos</a>
            <a href="#faq" className="text-slate-500 hover:text-slate-900">FAQ</a>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-slate-900">Contato</p>
            <a
              href={whatsappLink(WHATSAPP_MESSAGES.contato)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
            >
              <MessageCircle className="h-4 w-4" />
              {phoneDisplay}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {year} Siarom AI. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
