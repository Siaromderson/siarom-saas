"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlugZap } from "lucide-react";
import { desconectarWhatsapp } from "@/app/crm/configuracoes/actions";
import type { Empresa } from "@/lib/empresaContext";
import { WhatsappConnect } from "@/components/crm/WhatsappConnect";

export function WhatsappPanel({ empresa }: { empresa: Empresa }) {
  const router = useRouter();
  const [desconectando, startDesconectar] = useTransition();
  const [erroDesc, setErroDesc] = useState<string | null>(null);
  const conectado = empresa.uazapi_status === "conectado";

  function desconectar() {
    setErroDesc(null);
    startDesconectar(async () => {
      const res = await desconectarWhatsapp();
      if (res.error) setErroDesc(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Conexão totalmente automática: gera a instância e o QR Code na hora. */}
      <WhatsappConnect empresa={empresa} />

      {conectado && (
        <section className="card flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Desconectar WhatsApp
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Encerra a sessão atual. Você pode reconectar gerando um novo QR Code.
            </p>
          </div>
          <button
            type="button"
            onClick={desconectar}
            disabled={desconectando}
            className="btn-ghost text-red-600 hover:border-red-300 hover:bg-red-50"
          >
            {desconectando ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
            Desconectar
          </button>
        </section>
      )}

      {erroDesc && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {erroDesc}
        </p>
      )}
    </div>
  );
}
