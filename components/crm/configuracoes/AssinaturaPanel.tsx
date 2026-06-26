"use client";

import Link from "next/link";
import { ArrowUpRight, Crown, Receipt, CheckCircle2, Clock } from "lucide-react";
import { PLANS, getPlan, formatBRL } from "@/lib/plans";
import { PLANO_RANK, type PlanoId } from "@/lib/features";

export interface PagamentoHist {
  plano: string;
  chave: string;
  usada: boolean;
  created_at: string;
}

interface Props {
  plano: string;
  status: string; // trial | ativo | expirado
  /** fim do teste / próxima cobrança (ISO) ou null */
  vencimento: string | null;
  historico: PagamentoHist[];
}

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

const STATUS_BADGE: Record<string, string> = {
  trial: "bg-amber-100 text-amber-700",
  ativo: "bg-accent-500/15 text-accent-600",
  expirado: "bg-red-50 text-red-700",
};

export function AssinaturaPanel({ plano, status, vencimento, historico }: Props) {
  const atual = getPlan(plano);
  const rankAtual = PLANO_RANK[(plano as PlanoId) ?? "bronze"] ?? 1;
  const upgrades = PLANS.filter((p) => PLANO_RANK[p.id] > rankAtual);

  return (
    <div className="space-y-6">
      {/* Plano atual */}
      <section className="card p-6">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-lg font-bold text-slate-900">Plano atual</h2>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-2xl font-bold capitalize text-slate-900">
                {atual?.name ?? plano ?? "—"}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  STATUS_BADGE[status] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {status}
              </span>
            </div>
            {atual && (
              <p className="mt-1 text-sm text-slate-500">{atual.tagline}</p>
            )}
            <p className="mt-3 font-display text-xl font-bold text-slate-900">
              {atual ? `${formatBRL(atual.monthlyPrice)}` : "—"}
              <span className="text-sm font-normal text-slate-500">/mês</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm">
            <p className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-4 w-4" />
              {status === "trial" ? "Fim do teste grátis" : "Próxima cobrança"}
            </p>
            <p className="mt-0.5 font-semibold text-slate-900">{formatarData(vencimento)}</p>
          </div>
        </div>
      </section>

      {/* Upgrades */}
      {upgrades.length > 0 && (
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {status === "trial" ? "Escolha seu plano" : "Fazer upgrade"}
          </h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Desbloqueie mais recursos para a Alice e seu CRM.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upgrades.map((p) => (
              <div
                key={p.id}
                className={`flex flex-col rounded-2xl border p-5 ${
                  p.highlight
                    ? "border-brand-300 bg-brand-500/5"
                    : "border-white/60 bg-white/50"
                }`}
              >
                <p className="font-display text-lg font-bold text-slate-900">{p.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{p.tagline}</p>
                <p className="mt-3 font-display text-xl font-bold text-slate-900">
                  {formatBRL(p.monthlyPrice)}
                  <span className="text-sm font-normal text-slate-500">/mês</span>
                </p>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {p.inherits && (
                    <li className="text-xs font-semibold text-brand-600">
                      Tudo do {p.inherits} +
                    </li>
                  )}
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/#planos" className="btn-primary mt-4 w-full">
                  Fazer upgrade <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Histórico de pagamentos */}
      <section className="card p-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            Histórico de pagamentos
          </h2>
        </div>

        {historico.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-400">
            Nenhum pagamento registrado ainda.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-semibold">Data</th>
                  <th className="py-2 pr-4 font-semibold">Plano</th>
                  <th className="py-2 pr-4 font-semibold">Valor</th>
                  <th className="py-2 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, i) => {
                  const plan = getPlan(h.plano);
                  return (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 pr-4 text-slate-700">
                        {formatarData(h.created_at)}
                      </td>
                      <td className="py-2.5 pr-4 capitalize text-slate-700">
                        {plan?.name ?? h.plano}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700">
                        {plan ? formatBRL(plan.setupPrice) : "—"}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            h.usada
                              ? "bg-accent-500/15 text-accent-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {h.usada ? "Ativado" : "Pago"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
