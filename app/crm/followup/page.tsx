import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";
import { FollowupConfig } from "@/components/crm/FollowupConfig";
import { normalizarConfig, CONFIG_PADRAO } from "@/lib/followup";

export const metadata = { title: "Follow-up" };

export default async function FollowupPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "followup")) return <RecursoBloqueado section="followup" />;
  const supabase = await createClient();

  const { data } = await supabase
    .from("followup_config")
    .select("*")
    .eq("empresa_id", empresa!.id)
    .maybeSingle();

  const config = data ? normalizarConfig(data) : CONFIG_PADRAO;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Follow-up</h1>
        <p className="text-sm text-slate-500">
          Configure cadências automáticas para reengajar leads que pararam de responder.
        </p>
      </div>
      <FollowupConfig inicial={config} />
    </div>
  );
}
