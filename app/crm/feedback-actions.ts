"use server";

import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";

export async function enviarFeedback(nota: number, comentario: string) {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const supabase = await createClient();
  const { error } = await supabase.from("feedbacks").insert({
    empresa_id: empresa.id,
    nota,
    comentario: comentario.trim() || null,
    recomendaria: nota >= 4,
  });
  if (error) return { error: error.message };

  // Marca que esta empresa já enviou feedback (não mostrar de novo)
  await supabase
    .from("empresas")
    .update({ feedback_enviado: true })
    .eq("id", empresa.id);

  return { ok: true };
}
