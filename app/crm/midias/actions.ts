"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import {
  MIDIAS_BUCKET,
  tipoDoMime,
  normalizarMomento,
  type Midia,
  type MidiaMomento,
} from "@/lib/midias";

export interface MidiaResult {
  error?: string;
  ok?: boolean;
  midia?: Midia;
}

const SEM_ACESSO = "Recurso disponível apenas no plano Diamante.";

/**
 * Registra no banco uma mídia já enviada ao Storage pelo navegador.
 * O upload do arquivo é feito no cliente (suporta vídeos grandes); aqui
 * validamos o plano, conferimos que o caminho pertence à empresa e geramos
 * o link público.
 */
export async function registrarMidia(input: {
  nome: string;
  storage_path: string;
  mime_type: string;
  tamanho: number;
}): Promise<MidiaResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };
  if (!temAcesso(empresa, "midias")) return { error: SEM_ACESSO };

  // O caminho precisa estar sob o prefixo da própria empresa.
  if (!input.storage_path.startsWith(`${empresa.id}/`)) {
    return { error: "Caminho de arquivo inválido." };
  }

  const supabase = await createClient();
  const { data: pub } = supabase.storage
    .from(MIDIAS_BUCKET)
    .getPublicUrl(input.storage_path);

  const { data, error } = await supabase
    .from("midias")
    .insert({
      empresa_id: empresa.id,
      nome: String(input.nome || "Arquivo").slice(0, 200),
      tipo: tipoDoMime(input.mime_type),
      mime_type: input.mime_type || null,
      tamanho: Number.isFinite(input.tamanho) ? Math.round(input.tamanho) : null,
      storage_path: input.storage_path,
      url_publica: pub.publicUrl,
      momento: "inicio_conversa",
    })
    .select("*")
    .single();

  if (error || !data) {
    // Evita arquivo órfão no bucket se o insert falhar.
    await supabase.storage.from(MIDIAS_BUCKET).remove([input.storage_path]);
    return { error: "Não foi possível registrar a mídia." };
  }

  revalidatePath("/crm/midias");
  return { ok: true, midia: data as Midia };
}

/**
 * Atualiza a regra de envio de uma mídia: momento e (quando "ao_oferecer")
 * o produto/serviço vinculado.
 */
export async function atualizarConfigMidia(input: {
  id: string;
  momento: MidiaMomento;
  servico_nome: string | null;
}): Promise<MidiaResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };
  if (!temAcesso(empresa, "midias")) return { error: SEM_ACESSO };

  const momento = normalizarMomento(input.momento);
  const servico_nome =
    momento === "ao_oferecer"
      ? String(input.servico_nome || "").trim() || null
      : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("midias")
    .update({ momento, servico_nome })
    .eq("id", input.id)
    .eq("empresa_id", empresa.id);

  if (error) return { error: "Não foi possível salvar a configuração." };
  revalidatePath("/crm/midias");
  return { ok: true };
}

/** Remove a mídia do banco e o arquivo do Storage. */
export async function excluirMidia(id: string): Promise<MidiaResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };
  if (!temAcesso(empresa, "midias")) return { error: SEM_ACESSO };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("midias")
    .select("storage_path")
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .maybeSingle();

  if (!row) return { error: "Mídia não encontrada." };

  await supabase.storage
    .from(MIDIAS_BUCKET)
    .remove([row.storage_path as string]);

  const { error } = await supabase
    .from("midias")
    .delete()
    .eq("id", id)
    .eq("empresa_id", empresa.id);

  if (error) return { error: "Não foi possível excluir a mídia." };
  revalidatePath("/crm/midias");
  return { ok: true };
}
