"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import type { Etapa } from "@/lib/crm";

// Atualiza a etapa (e status) de um chat ao arrastar no Kanban.
// RLS garante que só atualiza chats da própria empresa; reforçamos por empresa_id.
export async function moverEtapa(chatId: string, etapa: Etapa) {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("chats")
    .update({ etapa, status: etapa })
    .eq("id", chatId)
    .eq("empresa_id", empresa.id);

  if (error) return { error: error.message };
  revalidatePath("/crm/kanban");
  return { ok: true };
}
