import { MessageCircle } from "lucide-react";
import { whatsappLink, WHATSAPP_MESSAGES } from "@/lib/constants";

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGES.contato)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 font-bold text-white shadow-xl shadow-[#25D366]/30 transition-all hover:-translate-y-0.5 hover:brightness-105"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-300 group-hover:max-w-[120px] sm:inline">
        Fale conosco
      </span>
    </a>
  );
}
