import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { ContatosList } from "@/components/crm/ContatosList";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";
import type { Chat } from "@/lib/crm";

export const metadata = { title: "Contatos" };

export default async function ContatosPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "contatos")) return <RecursoBloqueado section="contatos" />;
  const supabase = await createClient();

  const { data } = await supabase
    .from("chats")
    .select("*")
    .eq("empresa_id", empresa!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Contatos</h1>
        <p className="text-sm text-slate-500">
          Todos os leads e conversas da sua empresa. Clique para ver o histórico.
        </p>
      </div>
      <ContatosList chats={(data ?? []) as Chat[]} />
    </div>
  );
}
