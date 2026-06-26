import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";
import type { Chat } from "@/lib/crm";

export const metadata = { title: "Kanban" };

export default async function KanbanPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "kanban")) return <RecursoBloqueado section="kanban" />;
  const supabase = await createClient();

  const { data } = await supabase
    .from("chats")
    .select("*")
    .eq("empresa_id", empresa!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Kanban</h1>
        <p className="text-sm text-slate-500">
          Arraste os cards entre as colunas para atualizar a etapa do lead.
        </p>
      </div>
      <KanbanBoard chatsIniciais={(data ?? []) as Chat[]} />
    </div>
  );
}
