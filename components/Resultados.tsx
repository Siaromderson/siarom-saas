import { TrendingUp, Clock, CalendarCheck } from "lucide-react";

// TODO: substituir pelos cases reais de clientes (nome, segmento, métrica e depoimento).
const CASES = [
  {
    icon: TrendingUp,
    empresa: "Cliente exemplo",
    segmento: "Clínica de estética",
    metrica: "+40%",
    metricaLabel: "em agendamentos",
    depoimento:
      "Depoimento do cliente em breve. Espaço reservado para o resultado real obtido com a Alice.",
  },
  {
    icon: Clock,
    empresa: "Cliente exemplo",
    segmento: "Barbearia",
    metrica: "24h",
    metricaLabel: "de atendimento",
    depoimento:
      "Depoimento do cliente em breve. Espaço reservado para o resultado real obtido com a Alice.",
  },
  {
    icon: CalendarCheck,
    empresa: "Cliente exemplo",
    segmento: "Consultório odontológico",
    metrica: "-70%",
    metricaLabel: "de faltas",
    depoimento:
      "Depoimento do cliente em breve. Espaço reservado para o resultado real obtido com a Alice.",
  },
];

export default function Resultados() {
  return (
    <section id="resultados" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Resultados Reais</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Negócios que <span className="gradient-text">cresceram</span> com a Alice
          </h2>
          <p className="mt-4 text-slate-600">
            Veja o impacto que o atendimento automático da Siarom AI gera no dia a dia
            de quem já usa.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <div key={i} className="card flex flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-500/10 text-accent-600">
                <c.icon className="h-6 w-6" />
              </span>

              <div className="mt-5 flex items-end gap-2">
                <span className="font-display text-4xl font-extrabold text-slate-900">
                  {c.metrica}
                </span>
                <span className="mb-1.5 text-sm text-slate-500">{c.metricaLabel}</span>
              </div>

              <p className="mt-4 flex-1 text-sm text-slate-600">“{c.depoimento}”</p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="font-semibold text-slate-900">{c.empresa}</p>
                <p className="text-sm text-slate-500">{c.segmento}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
