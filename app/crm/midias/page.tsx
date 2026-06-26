import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";
import { MidiasManager } from "@/components/crm/midias/MidiasManager";
import type { Midia } from "@/lib/midias";

export const metadata = { title: "Mídias" };

interface Servico {
  nome: string;
  valor: string;
}

export default async function MidiasPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "midias")) return <RecursoBloqueado section="midias" />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("midias")
    .select("*")
    .eq("empresa_id", empresa!.id)
    .order("created_at", { ascending: false });

  const midias = (data ?? []) as Midia[];

  // Produtos/serviços cadastrados (aba Dados da empresa) — usados para
  // vincular cada mídia a um serviço específico.
  const servicosRaw = empresa!.servicos;
  const servicos: Servico[] = Array.isArray(servicosRaw)
    ? (servicosRaw as Servico[]).filter((s) => s && s.nome)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Mídias</h1>
        <p className="text-sm text-slate-500">
          Envie imagens, vídeos e documentos e diga quando a Alice deve mandá-los
          automaticamente nas conversas.
        </p>
      </div>

      <MidiasManager
        empresaId={empresa!.id}
        inicial={midias}
        servicos={servicos}
      />
    </div>
  );
}
