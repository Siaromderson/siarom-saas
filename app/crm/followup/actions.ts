"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { normalizarConfig, type FollowupConfig } from "@/lib/followup";

export interface FollowupResult {
  error?: string;
  ok?: boolean;
}

/**
 * Salva (upsert) a configuração de follow-up da empresa.
 * Há no máximo uma linha por empresa (índice único em empresa_id).
 */
export async function salvarFollowup(
  entrada: FollowupConfig
): Promise<FollowupResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };
  if (!temAcesso(empresa, "followup")) {
    return { error: "Seu plano não inclui o Follow-up automático." };
  }

  // Sanitiza no servidor — nunca confie no payload do cliente.
  const cfg = normalizarConfig(entrada);

  const supabase = await createClient();
  const { error } = await supabase
    .from("followup_config")
    .upsert(
      {
        empresa_id: empresa.id,
        ativo: cfg.ativo,
        cadencias: cfg.cadencias,
        enviar_fim_de_semana: cfg.enviar_fim_de_semana,
        horario_inicio: cfg.horario_inicio,
        horario_fim: cfg.horario_fim,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "empresa_id" }
    );

  if (error) return { error: error.message };
  revalidatePath("/crm/followup");
  return { ok: true };
}
