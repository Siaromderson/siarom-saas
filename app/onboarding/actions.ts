"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";

export interface OnboardingState {
  error?: string;
  ok?: boolean;
}

const CAMPOS = [
  "nome_empresa",
  "nome_responsavel",
  "telefone",
  "nome_ia",
  "personalidade_ia",
  "tom_de_voz",
  "segmento",
  "horario_atendimento",
  "publico_alvo",
  "produtos_servicos",
  "objetivo_ia",
  "saudacao_inicial",
  "instrucoes_extras",
] as const;

// Salva os dados do onboarding na empresa. redirectAfter=true → vai pro CRM
// (fluxo de onboarding); false → fica na página (edição em Configurações).
export async function salvarOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const empresa = await getEmpresaAtual();
  if (!empresa) redirect("/login");

  const nome = String(formData.get("nome_empresa") || "").trim();
  if (!nome) return { error: "Informe o nome da empresa." };

  const redirectAfter = String(formData.get("redirectAfter") || "") === "true";

  const dados: Record<string, unknown> = { onboarding_completo: true };
  for (const c of CAMPOS) {
    dados[c] = String(formData.get(c) || "").trim() || null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update(dados)
    .eq("id", empresa.id);

  if (error) {
    console.error("Erro ao salvar onboarding:", error.message);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  if (redirectAfter) redirect("/crm");
  return { ok: true };
}
