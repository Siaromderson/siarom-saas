import { SmilePlus } from "lucide-react";
import { SENTIMENTO_DEF, type Sentimento } from "@/lib/crm";

const ORDEM: Sentimento[] = ["positivo", "neutro", "negativo"];

// Distribuição de sentimentos das conversas no período (vem do Dashboard).
export function SentimentosCard({
  sentimentos,
  periodo,
}: {
  sentimentos: Record<Sentimento, number>;
  periodo: string;
}) {
  const total = ORDEM.reduce((s, k) => s + sentimentos[k], 0);

  // Sentimento predominante (para o destaque)
  const dominante = ORDEM.reduce((a, b) =>
    sentimentos[b] > sentimentos[a] ? b : a
  );

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <SmilePlus className="h-5 w-5 text-brand-600" />
          Sentimentos dos atendimentos
        </h2>
        <span className="text-xs text-slate-500">{periodo}</span>
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Sem conversas classificadas neste período.
        </p>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-3">
            <span className="text-3xl">{SENTIMENTO_DEF[dominante].emoji}</span>
            <div>
              <p className="text-sm text-slate-500">Predominante</p>
              <p className="font-display text-lg font-bold text-slate-900">
                {SENTIMENTO_DEF[dominante].label}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-slate-500">Conversas</p>
              <p className="font-display text-lg font-bold text-slate-900">{total}</p>
            </div>
          </div>

          {/* Barra empilhada */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {ORDEM.map((k) => {
              const pct = (sentimentos[k] / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={k}
                  className={SENTIMENTO_DEF[k].bar}
                  style={{ width: `${pct}%` }}
                  title={`${SENTIMENTO_DEF[k].label}: ${sentimentos[k]}`}
                />
              );
            })}
          </div>

          {/* Legenda detalhada */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {ORDEM.map((k) => {
              const pct = total ? Math.round((sentimentos[k] / total) * 100) : 0;
              return (
                <div
                  key={k}
                  className="rounded-xl border border-white/50 bg-white/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SENTIMENTO_DEF[k].cls}`}
                    >
                      {SENTIMENTO_DEF[k].emoji} {SENTIMENTO_DEF[k].label}
                    </span>
                    <span className="text-xs text-slate-400">{pct}%</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">
                    {sentimentos[k]}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
