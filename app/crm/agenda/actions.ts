"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";

export interface AgendaResult {
  error?: string;
  ok?: boolean;
}

export async function salvarAgendamento(
  _prev: AgendaResult,
  formData: FormData
): Promise<AgendaResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const id = String(formData.get("id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  const contato_nome = String(formData.get("contato_nome") || "").trim() || null;
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const inicio = String(formData.get("inicio") || "");
  const fim = String(formData.get("fim") || "") || null;
  const status = String(formData.get("status") || "agendado");

  if (!titulo || !inicio) {
    return { error: "Informe título e data/hora de início." };
  }

  const supabase = await createClient();
  const payload = {
    empresa_id: empresa.id,
    titulo,
    contato_nome,
    descricao,
    inicio: new Date(inicio).toISOString(),
    fim: fim ? new Date(fim).toISOString() : null,
    status,
  };

  const { error } = id
    ? await supabase.from("agendamentos").update(payload).eq("id", id).eq("empresa_id", empresa.id)
    : await supabase.from("agendamentos").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/crm/agenda");
  return { ok: true };
}

export async function excluirAgendamento(id: string): Promise<AgendaResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("agendamentos")
    .delete()
    .eq("id", id)
    .eq("empresa_id", empresa.id);

  if (error) return { error: error.message };
  revalidatePath("/crm/agenda");
  return { ok: true };
}
