import { CreditCard, KeyRound, Wand2, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: CreditCard,
    title: "Escolha seu plano",
    desc: "Selecione o plano ideal e pague com segurança via Pix ou cartão (AbacatePay).",
  },
  {
    icon: KeyRound,
    title: "Receba sua chave",
    desc: "Na hora, você recebe por email a chave de ativação do seu acesso.",
  },
  {
    icon: Wand2,
    title: "A Alice te guia",
    desc: "Ao entrar, a própria Alice conduz você passo a passo: conecta o WhatsApp, configura o atendimento e apresenta o CRM.",
  },
  {
    icon: Rocket,
    title: "Alice assume",
    desc: "A Alice passa a atender, tirar dúvidas e marcar agendamentos 24h por dia.",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Como funciona</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Da ativação ao atendimento em <span className="gradient-text">4 passos</span>
          </h2>
          <p className="mt-4 text-slate-600">
            Sem complicação técnica. A integração é <strong className="text-slate-900">guiada pela
            própria Alice</strong> — você só acompanha.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card relative p-6">
              <span className="absolute right-5 top-5 font-display text-4xl font-bold text-slate-100">
                0{i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
