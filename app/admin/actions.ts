"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { SECTIONS, type SectionId } from "@/lib/features";
import type { PlanoId } from "@/lib/features";

export interface AdminResult {
  error?: string;
  ok?: boolean;
}

const PLANOS_VALIDOS: PlanoId[] = ["bronze", "prata", "ouro", "diamante"];

/** Altera o plano de uma empresa. */
export async function atualizarPlano(
  empresaId: string,
  plano: string
): Promise<AdminResult> {
  await requireAdmin();
  if (!PLANOS_VALIDOS.includes(plano as PlanoId)) {
    return { error: "Plano inválido." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("empresas")
    .update({ plano })
    .eq("id", empresaId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/${empresaId}`);
  revalidatePath("/admin");
  return { ok: true };
}

/** Libera ou bloqueia uma seção individual (além do plano). */
export async function toggleRecurso(
  empresaId: string,
  sectionId: string
): Promise<AdminResult> {
  await requireAdmin();
  if (!(sectionId in SECTIONS)) return { error: "Seção inválida." };

  const admin = createAdminClient();
  const { data: row, error: readErr } = await admin
    .from("empresas")
    .select("recursos_liberados")
    .eq("id", empresaId)
    .maybeSingle();
  if (readErr) return { error: readErr.message };

  const atuais: string[] = Array.isArray(row?.recursos_liberados)
    ? (row!.recursos_liberados as string[])
    : [];
  const novos = atuais.includes(sectionId)
    ? atuais.filter((s) => s !== sectionId)
    : [...atuais, sectionId as SectionId];

  const { error } = await admin
    .from("empresas")
    .update({ recursos_liberados: novos })
    .eq("id", empresaId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/${empresaId}`);
  return { ok: true };
}

/** Promove/rebaixa uma empresa a admin. */
export async function definirAdmin(
  empresaId: string,
  valor: boolean
): Promise<AdminResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("empresas")
    .update({ is_admin: valor })
    .eq("id", empresaId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/${empresaId}`);
  revalidatePath("/admin");
  return { ok: true };
}
