"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Wifi, WifiOff, PlugZap } from "lucide-react";
import {
  salvarWhatsapp,
  desconectarWhatsapp,
  type WhatsappResult,
} from "@/app/crm/configuracoes/actions";
import type { Empresa } from "@/lib/empresaContext";
import { WhatsappConnect } from "@/components/crm/WhatsappConnect";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30";

export function WhatsappPanel({ empresa }: { empresa: Empresa }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<WhatsappResult, FormData>(
    salvarWhatsapp,
    {}
  );
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
      {/* Credenciais + status */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Credenciais UAZAPI
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              conectado ? "bg-accent-500/15 text-accent-600" : "bg-red-50 text-red-700"
            }`}
          >
            {conectado ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {conectado ? "Conectado" : "Desconectado"}
          </span>
        </div>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          Número e credenciais da instância usada pela Alice para atender no WhatsApp.
        </p>

        <form action={formAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Número do WhatsApp
              </label>
              <input
                name="whatsapp_numero"
                type="text"
                placeholder="55 69 99999-9999"
                defaultValue={empresa.whatsapp_numero ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Instância UAZAPI
              </label>
              <input
                name="uazapi_instance"
                type="text"
                placeholder="Gerada automaticamente ao conectar"
                defaultValue={empresa.uazapi_instance ?? ""}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Token UAZAPI
              </label>
              <input
                name="uazapi_token"
                type="text"
                placeholder="Token da instância"
                defaultValue={empresa.uazapi_token ?? ""}
                className={fieldClass}
              />
            </div>
          </div>

          {state.error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-500/10 px-4 py-2.5 text-sm text-accent-600">
              <Check className="h-4 w-4" /> Credenciais salvas.
            </p>
          )}
          {erroDesc && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {erroDesc}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar credenciais"}
            </button>
            {conectado && (
              <button
                type="button"
                onClick={desconectar}
                disabled={desconectando}
                className="btn-ghost text-red-600 hover:border-red-300 hover:bg-red-50"
              >
                {desconectando ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
                Desconectar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Conexão / QR Code */}
      <WhatsappConnect empresa={empresa} />
    </div>
  );
}
