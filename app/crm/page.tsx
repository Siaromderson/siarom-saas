import { Suspense } from "react";
import {
  MessageSquare,
  UserPlus,
  CalendarCheck,
  RefreshCw,
  UserCog,
  MoonStar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { resolveRange, type Periodo } from "@/lib/dateRanges";
import { foraDoHorario, type Sentimento } from "@/lib/crm";
import { DashboardFilters } from "@/components/crm/DashboardFilters";
import { SentimentosCard } from "@/components/crm/SentimentosCard";
import { DashboardResumo } from "@/components/crm/DashboardResumo";
import { LineChart, type Point } from "@/components/crm/LineChart";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>;
}) {
  const sp = await searchParams;
  const periodo = (sp.periodo as Periodo) || "hoje";
  const range = resolveRange(periodo, sp.de, sp.ate);

  const empresa = await getEmpresaAtual();
  const supabase = await createClient();

  // Chats criados no período
  const { data: chatsPeriodo = [] } = await supabase
    .from("chats")
    .select("id, created_at, etapa, status, sentimento")
    .eq("empresa_id", empresa!.id)
    .gte("created_at", range.from)
    .lt("created_at", range.to);

  // Estado atual do pipeline (não depende do período)
  const { data: chatsTodos = [] } = await supabase
    .from("chats")
    .select("etapa")
    .eq("empresa_id", empresa!.id);

  // Agendamentos no período
  const { count: agendamentos } = await supabase
    .from("agendamentos")
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", empresa!.id)
    .gte("inicio", range.from)
    .lt("inicio", range.to);

  // Série dos últimos 14 dias (tendência de atendimentos) para o gráfico
  const desde14 = new Date();
  desde14.setHours(0, 0, 0, 0);
  desde14.setDate(desde14.getDate() - 13);
  const { data: chats14 = [] } = await supabase
    .from("chats")
    .select("created_at")
    .eq("empresa_id", empresa!.id)
    .gte("created_at", desde14.toISOString());

  const serie: Point[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(desde14);
    d.setDate(d.getDate() + i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = (chats14 ?? []).filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    return { label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: count };
  });

  const cp = chatsPeriodo ?? [];
  const todos = chatsTodos ?? [];

  const totalAtendimentos = cp.length;
  const leads = cp.length;
  const foraHorario = cp.filter((c) => foraDoHorario(c.created_at)).length;
  const emFollowup = todos.filter(
    (c) => c.etapa === "followup_1" || c.etapa === "followup_2"
  ).length;
  const aguardandoHumano = todos.filter((c) => c.etapa === "aguardando_humano").length;

  // Distribuição de sentimentos no período
  const sentimentos: Record<Sentimento, number> = { positivo: 0, neutro: 0, negativo: 0 };
  for (const c of cp) {
    const s = c.sentimento as Sentimento | null;
    if (s && s in sentimentos) sentimentos[s] += 1;
  }

  const cards = [
    { label: "Atendimentos", value: totalAtendimentos, icon: MessageSquare, hint: range.label },
    { label: "Leads no período", value: leads, icon: UserPlus, hint: range.label },
    { label: "Agendamentos", value: agendamentos ?? 0, icon: CalendarCheck, hint: range.label },
    { label: "Em follow-up", value: emFollowup, icon: RefreshCw, hint: "Pipeline atual" },
    { label: "Aguardando humano", value: aguardandoHumano, icon: UserCog, hint: "Pipeline atual" },
    { label: "Fora do horário", value: foraHorario, icon: MoonStar, hint: "Após 18h / antes 7h" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral do atendimento — {range.label}</p>
        </div>
        <Suspense fallback={null}>
          <DashboardFilters />
        </Suspense>
      </div>

      <DashboardResumo
        nome={empresa!.nome_empresa ?? "sua empresa"}
        periodo={range.label}
        atendimentos={totalAtendimentos}
        agendamentos={agendamentos ?? 0}
        leads={leads}
        aguardandoHumano={aguardandoHumano}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">
                  {c.value}
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Sentimentos dos atendimentos */}
      <SentimentosCard sentimentos={sentimentos} periodo={range.label} />

      {/* Gráfico de tendência */}
      <div className="card p-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Atendimentos por dia
          </h2>
          <span className="text-xs text-slate-500">Últimos 14 dias</span>
        </div>
        <LineChart data={serie} />
      </div>
    </div>
  );
}
