"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeKey, isValidKeyFormat } from "@/lib/activation";
import { getPlan } from "@/lib/plans";

const TRIAL_DIAS = 7;
// Durante o teste grátis o cliente experimenta os recursos do plano Ouro
// (Dashboard, Kanban, Contatos, Agenda e automações). Marketing/multicanal
// continua exclusivo do Diamante.
const TRIAL_PLANO = "ouro";

export interface ActionState {
  error?: string;
}

// ---- Cadastro: cria conta + empresa (trial ou plano pago via chave) ----
export async function signUp(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const modo = String(formData.get("modo") || "trial"); // "trial" | "chave"
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "");
  const chaveInput = String(formData.get("chave") || "");

  if (!email || senha.length < 6) {
    return { error: "Informe um email válido e uma senha com 6+ caracteres." };
  }

  let plano = TRIAL_PLANO;
  const agora = new Date();
  let demoInicio: string | null = agora.toISOString();
  let demoExpiraEm: string | null = new Date(
    agora.getTime() + TRIAL_DIAS * 86_400_000
  ).toISOString();
  let chaveValida: string | null = null;

  // Modo chave de ativação: valida ANTES de criar a conta
  if (modo === "chave") {
    const chave = normalizeKey(chaveInput);
    if (!isValidKeyFormat(chave)) {
      return { error: "Chave de ativação inválida." };
    }
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("chaves_ativacao")
      .select("*")
      .eq("chave", chave)
      .maybeSingle();

    if (!row) return { error: "Chave não encontrada." };
    if (row.usada) return { error: "Esta chave já foi utilizada." };

    plano = row.plano || "bronze";
    // conta paga: sem período de teste
    demoInicio = null;
    demoExpiraEm = null;
    chaveValida = chave;
  }

  // Cria o usuário no Supabase Auth
  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: senha,
  });
  if (signUpError) {
    return { error: traduzErroAuth(signUpError.message) };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  // Cria a empresa (tenant) vinculada ao usuário — via admin (ignora RLS no setup)
  const admin = createAdminClient();
  const { error: empresaError } = await admin.from("empresas").insert({
    user_id: userId,
    email,
    plano,
    demo_inicio: demoInicio,
    demo_expira_em: demoExpiraEm,
    onboarding_completo: false,
    termos_aceitos: false,
    nome_ia: "Alice",
  });
  if (empresaError) {
    console.error("Erro ao criar empresa:", empresaError.message);
    return { error: "Conta criada, mas houve um erro ao configurar a empresa." };
  }

  // Marca a chave como usada
  if (chaveValida) {
    await admin
      .from("chaves_ativacao")
      .update({ usada: true, usada_em: new Date().toISOString() })
      .eq("chave", chaveValida);
  }

  // Garante sessão (caso a confirmação de email esteja desativada no Supabase)
  if (!signUpData.session) {
    await supabase.auth.signInWithPassword({ email, password: senha });
  }

  redirect("/termos");
}

// ---- Login ----
export async function signIn(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "");
  const redirectTo = String(formData.get("redirect") || "/crm");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) return { error: traduzErroAuth(error.message) };

  redirect(redirectTo);
}

// ---- Logout ----
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function traduzErroAuth(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return "Email ou senha incorretos.";
  if (/already registered|already exists/i.test(msg))
    return "Este email já está cadastrado. Faça login.";
  if (/Email not confirmed/i.test(msg))
    return "Confirme seu email antes de entrar.";
  return msg;
}

// Reexport para uso em selects de UI sem duplicar a fonte
export async function planoLabel(id: string) {
  return getPlan(id)?.name ?? id;
}
