import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { AgendaView } from "@/components/crm/AgendaView";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";
import type { Agendamento } from "@/lib/crm";

export const metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "agenda")) return <RecursoBloqueado section="agenda" />;
  const supabase = await createClient();

  const { data } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("empresa_id", empresa!.id)
    .order("inicio", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-sm text-slate-500">
          Visualize, crie e edite os agendamentos da sua empresa.
        </p>
      </div>
      <AgendaView agendamentos={(data ?? []) as Agendamento[]} />
    </div>
  );
}
