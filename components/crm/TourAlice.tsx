"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ArrowRight, Check } from "lucide-react";

const KEY = "siarom_tour_alice";

interface Step {
  path: string;
  titulo: string;
  texto: string;
}

const STEPS: Step[] = [
  {
    path: "/crm",
    titulo: "Oi! Eu sou a Alice 👋",
    texto: "Vou te mostrar o seu CRM em 1 minuto. Este é o painel: aqui você vê o resumo dos atendimentos, agendamentos e o gráfico dos últimos dias.",
  },
  {
    path: "/crm/kanban",
    titulo: "Kanban de leads",
    texto: "Cada conversa vira um card. Arraste entre as colunas (Novo lead, Agendado, Follow-up...) para acompanhar a evolução de cada lead.",
  },
  {
    path: "/crm/contatos",
    titulo: "Contatos & histórico",
    texto: "Aqui ficam todos os seus contatos. Clique em qualquer um para ver o histórico completo da conversa.",
  },
  {
    path: "/crm/agenda",
    titulo: "Agenda",
    texto: "Os agendamentos que eu marcar aparecem aqui automaticamente — e você também pode criar e editar quando quiser.",
  },
  {
    path: "/crm/configuracoes",
    titulo: "Vamos te conectar 🔌",
    texto: "Por aqui você conecta seu WhatsApp e ajusta como eu devo atender. É o último passo para eu começar a trabalhar por você!",
  },
];

export function TourAlice() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(KEY)) {
      setOpen(true);
    }
  }, []);

  function fechar() {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  }

  function avancar() {
    if (step >= STEPS.length - 1) {
      fechar();
      return;
    }
    const next = step + 1;
    setStep(next);
    router.push(STEPS[next].path);
  }

  if (!open) return null;
  const s = STEPS[step];
  const ultimo = step === STEPS.length - 1;

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[calc(100vw-2rem)] max-w-sm animate-fade-up">
      <div className="card overflow-hidden shadow-2xl ring-1 ring-brand-200">
        {/* topo com Alice */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-brand-50 px-4 py-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-brand-300">
            <Image
              src="/imagens/alice-avatar.png"
              alt="Alice"
              width={44}
              height={44}
              className="h-full w-full object-cover object-top"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">{s.titulo}</p>
            <p className="text-xs text-brand-700">Assistente Siarom</p>
          </div>
          <button onClick={fechar} aria-label="Fechar tour" className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* corpo */}
        <div className="p-4">
          <p className="text-sm leading-relaxed text-slate-600">{s.texto}</p>

          <div className="mt-4 flex items-center justify-between">
            {/* progresso */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-5 bg-brand-500" : "w-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={fechar} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Fechar
              </button>
              <button onClick={avancar} className="btn-primary px-4 py-2 text-sm">
                {ultimo ? (
                  <>
                    Concluir <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Avançar <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
