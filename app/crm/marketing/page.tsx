import { Mail, MessageCircle, Instagram, Facebook, Sparkles } from "lucide-react";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";

export const metadata = { title: "Marketing" };

const CANAIS = [
  { icon: Mail, titulo: "Email Marketing", desc: "Disparos em massa para sua base." },
  { icon: MessageCircle, titulo: "WhatsApp Marketing", desc: "Campanhas e follow-up no WhatsApp." },
  { icon: Instagram, titulo: "Instagram", desc: "Atendimento e respostas no Direct." },
  { icon: Facebook, titulo: "Facebook", desc: "Mensagens do Messenger com a Alice." },
];

export default async function MarketingPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "marketing")) return <RecursoBloqueado section="marketing" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Marketing</h1>
        <p className="text-sm text-slate-500">
          Canais e campanhas do seu plano. Em breve você dispara tudo por aqui.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CANAIS.map((c) => (
          <div key={c.titulo} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
              <c.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-slate-900">{c.titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">
              <Sparkles className="h-3.5 w-3.5" /> Em breve
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
