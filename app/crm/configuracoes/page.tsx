import { getEmpresaAtual, getStatusLabel } from "@/lib/empresaContext";
import { createClient } from "@/lib/supabase/server";
import { ConfiguracoesTabs } from "@/components/crm/configuracoes/ConfiguracoesTabs";
import type { PagamentoHist } from "@/components/crm/configuracoes/AssinaturaPanel";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const empresa = (await getEmpresaAtual())!;
  const status = getStatusLabel(empresa);
  const supabase = await createClient();

  // Histórico de pagamentos: chaves de ativação geradas para o email da empresa
  let historico: PagamentoHist[] = [];
  if (empresa.email) {
    const { data: chaves } = await supabase
      .from("chaves_ativacao")
      .select("plano, chave, usada, created_at")
      .eq("email", empresa.email)
      .order("created_at", { ascending: false });
    historico = (chaves ?? []) as PagamentoHist[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">
          Dados da empresa, conexão do WhatsApp e assinatura.
        </p>
      </div>

      <ConfiguracoesTabs
        empresa={empresa}
        status={status}
        vencimento={empresa.demo_expira_em}
        historico={historico}
      />
    </div>
  );
}
