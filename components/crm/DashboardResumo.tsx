import Image from "next/image";
import { Sparkles, UserCog } from "lucide-react";

// Resumo do topo do dashboard, com a Alice "apresentando" os números.
export function DashboardResumo({
  nome,
  periodo,
  atendimentos,
  agendamentos,
  leads,
  aguardandoHumano,
}: {
  nome: string;
  periodo: string;
  atendimentos: number;
  agendamentos: number;
  leads: number;
  aguardandoHumano: number;
}) {
  return (
    <div className="card relative overflow-hidden p-6">
      <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-brand-gradient opacity-10 blur-3xl" />
      <div className="relative flex items-center gap-5">
        {/* Alice */}
        <div className="relative hidden shrink-0 sm:block">
          <div className="absolute inset-0 -z-10 translate-y-2 rounded-full bg-brand-500/10 blur-xl" />
          {/* Mostra apenas o tronco para cima: recorte via overflow + object-top */}
          <div className="h-32 w-24 overflow-hidden">
            <Image
              src="/imagens/alice-confident.png"
              alt="Alice"
              width={120}
              height={150}
              className="h-auto w-full object-cover object-top drop-shadow"
            />
          </div>
        </div>

        {/* Resumo */}
        <div className="min-w-0 flex-1">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Resumo da Alice
          </span>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">
            Olá! Aqui está o resumo de <b className="text-slate-900">{periodo.toLowerCase()}</b>:
            você teve{" "}
            <b className="text-brand-700">{atendimentos} atendimento{atendimentos === 1 ? "" : "s"}</b>,{" "}
            <b className="text-brand-700">{agendamentos} agendamento{agendamentos === 1 ? "" : "s"}</b> e{" "}
            <b className="text-brand-700">{leads} novo{leads === 1 ? "" : "s"} lead{leads === 1 ? "" : "s"}</b>.
          </p>
          {aguardandoHumano > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
              <UserCog className="h-4 w-4" />
              {aguardandoHumano} conversa{aguardandoHumano === 1 ? "" : "s"} aguardando atendimento humano.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
