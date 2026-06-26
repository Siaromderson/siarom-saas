"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";

export async function aceitarTermos() {
  const empresa = await getEmpresaAtual();
  if (!empresa) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("empresas")
    .update({ termos_aceitos: true, termos_aceitos_em: new Date().toISOString() })
    .eq("id", empresa.id);

  redirect(empresa.onboarding_completo ? "/crm" : "/onboarding");
}
