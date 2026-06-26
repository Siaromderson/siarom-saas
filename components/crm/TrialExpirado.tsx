import Link from "next/link";
import { Lock, Check } from "lucide-react";
import { PLANS, formatBRL } from "@/lib/plans";

// Tela de bloqueio + conversão exibida quando o teste grátis expira.
export function TrialExpirado() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-500/15 text-brand-600">
          <Lock className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Seu teste grátis terminou
        </h1>
        <p className="mt-3 text-slate-600">
          Para continuar usando a <span className="gradient-text font-semibold">Alice</span> e o CRM,
          escolha um plano. Seus dados continuam salvos.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <Link
              key={plan.id}
              href="/#planos"
              className={`card flex flex-col p-5 text-left transition hover:-translate-y-0.5 ${
                plan.highlight ? "border-brand-500/50" : ""
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900">{plan.name}</h3>
                <span className="font-display text-xl font-extrabold text-slate-900">
                  {formatBRL(plan.monthlyPrice)}
                  <span className="text-xs font-normal text-slate-500">/mês</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{plan.tagline}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <Link href="/#planos" className="btn-primary mt-8">
          Ver todos os planos
        </Link>
      </div>
    </div>
  );
}
