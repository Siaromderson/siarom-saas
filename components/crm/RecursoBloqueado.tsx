import Link from "next/link";
import { Lock, ArrowUpCircle, Check } from "lucide-react";
import { SECTIONS, planoNecessario, type SectionId } from "@/lib/features";
import { getPlan, PLANS } from "@/lib/plans";

// Tela exibida quando o cliente tenta acessar uma seção que o plano dele
// não inclui. Explica que o recurso é do plano X e oferece o upgrade.
export function RecursoBloqueado({ section }: { section: SectionId }) {
  const sec = SECTIONS[section];
  const planoId = planoNecessario(section);
  const plano = getPlan(planoId);
  const planoNome = plano?.name ?? planoId;

  // Recursos que o cliente passa a ter ao subir para o plano exigido
  const destaques = plano?.features?.slice(0, 4) ?? [];

  return (
    <div className="mx-auto max-w-xl py-6">
      <div className="glass relative overflow-hidden p-8 text-center">
        {/* brilho decorativo */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-glow opacity-60" />

        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/15 text-brand-600 shadow-glass">
            <Lock className="h-7 w-7" />
          </span>

          <h1 className="mt-5 font-display text-2xl font-bold text-slate-900">
            {sec.label} é do plano {planoNome}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {sec.descricao} Esse recurso está disponível a partir do plano{" "}
            <span className="font-semibold text-brand-600">{planoNome}</span>. Faça o
            upgrade para liberar.
          </p>

          {destaques.length > 0 && (
            <ul className="mx-auto mt-5 grid max-w-sm gap-2 text-left">
              {destaques.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 shrink-0 text-accent-500" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/crm/configuracoes#plano" className="btn-primary">
              <ArrowUpCircle className="h-4 w-4" />
              Fazer upgrade para {planoNome}
            </Link>
            <Link href="/#planos" className="btn-glass">
              Ver todos os planos
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Planos disponíveis: {PLANS.map((p) => p.name).join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
