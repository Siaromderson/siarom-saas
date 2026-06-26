"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

export function TrialBanner({
  diasRestantes,
  horasRestantes,
}: {
  diasRestantes: number;
  horasRestantes: number;
}) {
  const texto =
    diasRestantes > 1
      ? `${diasRestantes} dias restantes`
      : `${horasRestantes}h restantes`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-brand-gradient px-4 py-2 text-center text-sm font-medium text-white">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        Teste grátis — <b>{texto}</b>
      </span>
      <Link
        href="/crm/configuracoes#plano"
        className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur transition hover:bg-white/30"
      >
        Assinar plano
      </Link>
    </div>
  );
}
