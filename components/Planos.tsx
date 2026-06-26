"use client";

import { useState } from "react";
import { Check, Loader2, Star, Gem } from "lucide-react";
import { PLANS, formatBRL, type Plan } from "@/lib/plans";

export default function Planos() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: Plan) {
    try {
      setError(null);
      setLoadingId(plan.id);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Não foi possível iniciar o checkout.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
      setLoadingId(null);
    }
  }

  return (
    <section id="planos" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Planos</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Escolha o plano <span className="gradient-text">ideal</span> para o seu negócio
          </h2>
          <p className="mt-4 text-slate-600">
            Taxa única de implementação + mensalidade. Sem fidelidade, cancele quando quiser.
          </p>
        </div>

        {error && (
          <p className="mx-auto mt-8 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              loading={loadingId === plan.id}
              disabled={loadingId !== null}
              onSubscribe={() => handleSubscribe(plan)}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          A implementação é cobrada uma única vez. A mensalidade é recorrente.
        </p>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  loading,
  disabled,
  onSubscribe,
}: {
  plan: Plan;
  loading: boolean;
  disabled: boolean;
  onSubscribe: () => void;
}) {
  return (
    <div
      className={`relative flex flex-col p-6 ${
        plan.highlight
          ? "card border-brand-300 ring-1 ring-brand-200 shadow-lg shadow-brand-600/10 lg:-mt-4 lg:mb-0"
          : "card"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white shadow-lg">
          <Star className="h-3.5 w-3.5 fill-white" />
          Mais popular
        </span>
      )}

      <h3 className="font-display text-xl font-bold text-slate-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span className="font-display text-4xl font-extrabold text-slate-900">
            {formatBRL(plan.monthlyPrice)}
          </span>
          <span className="mb-1 text-sm text-slate-500">/mês</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          + {formatBRL(plan.setupPrice)} de implementação
        </p>
      </div>

      <button
        onClick={onSubscribe}
        disabled={disabled}
        className={`mt-6 w-full ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecionando...
          </>
        ) : (
          "Assinar agora"
        )}
      </button>

      <ul className="mt-6 space-y-3 text-sm">
        {plan.inherits && (
          <li className="font-semibold text-brand-700">Tudo do {plan.inherits}, mais:</li>
        )}
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
            {f}
          </li>
        ))}
        {plan.exclusiveFeature && (
          <li className="flex items-start gap-2 rounded-lg bg-brand-500/10 px-2 py-1.5 font-semibold text-brand-700">
            <Gem className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {plan.exclusiveFeature}
          </li>
        )}
      </ul>
    </div>
  );
}
