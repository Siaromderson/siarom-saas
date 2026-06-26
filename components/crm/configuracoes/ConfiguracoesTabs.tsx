"use client";

import { useState } from "react";
import { Building2, MessageCircle, CreditCard } from "lucide-react";
import type { Empresa } from "@/lib/empresaContext";
import { DadosEmpresaForm } from "./DadosEmpresaForm";
import { WhatsappPanel } from "./WhatsappPanel";
import { AssinaturaPanel, type PagamentoHist } from "./AssinaturaPanel";

type TabId = "dados" | "whatsapp" | "assinatura";

const TABS: { id: TabId; label: string; Icon: typeof Building2 }[] = [
  { id: "dados", label: "Dados da empresa", Icon: Building2 },
  { id: "whatsapp", label: "Conexão WhatsApp", Icon: MessageCircle },
  { id: "assinatura", label: "Assinatura", Icon: CreditCard },
];

interface Props {
  empresa: Empresa;
  status: string;
  vencimento: string | null;
  historico: PagamentoHist[];
}

export function ConfiguracoesTabs({
  empresa,
  status,
  vencimento,
  historico,
}: Props) {
  const [tab, setTab] = useState<TabId>("dados");

  return (
    <div>
      {/* Navegação por abas */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/60 bg-white/50 p-1 backdrop-blur-md">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? "bg-brand-gradient text-white shadow-lg shadow-brand-700/20"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "dados" && (
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Dados da empresa & Alice
          </h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            As mesmas informações do onboarding. Atualize quando quiser.
          </p>
          <DadosEmpresaForm empresa={empresa} />
        </section>
      )}

      {tab === "whatsapp" && <WhatsappPanel empresa={empresa} />}

      {tab === "assinatura" && (
        <AssinaturaPanel
          plano={empresa.plano ?? "bronze"}
          status={status}
          vencimento={vencimento}
          historico={historico}
        />
      )}
    </div>
  );
}
