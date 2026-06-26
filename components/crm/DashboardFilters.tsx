"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PERIODO_LABEL, type Periodo } from "@/lib/dateRanges";

const PERIODOS = Object.keys(PERIODO_LABEL) as Periodo[];

export function DashboardFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const atual = (params.get("periodo") as Periodo) || "hoje";
  const [de, setDe] = useState(params.get("de") || "");
  const [ate, setAte] = useState(params.get("ate") || "");

  function aplicar(periodo: Periodo, extra?: Record<string, string>) {
    const sp = new URLSearchParams();
    sp.set("periodo", periodo);
    if (extra?.de) sp.set("de", extra.de);
    if (extra?.ate) sp.set("ate", extra.ate);
    router.push(`/crm?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODOS.map((p) => (
        <button
          key={p}
          onClick={() => p !== "personalizado" && aplicar(p)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            atual === p
              ? "bg-brand-gradient text-white"
              : "border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          {PERIODO_LABEL[p]}
        </button>
      ))}

      {atual === "personalizado" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          />
          <span className="text-slate-500">→</span>
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          />
          <button
            onClick={() => de && ate && aplicar("personalizado", { de, ate })}
            className="btn-primary px-4 py-1.5 text-sm"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
