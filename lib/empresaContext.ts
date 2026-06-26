import { createClient } from "@/lib/supabase/server";

// Resolve a empresa (tenant) do usuário logado.
// Vínculo: empresas.user_id == auth.users.id (1 empresa por conta).
// Toda query do CRM deve filtrar por empresa.id para isolar os dados.
//
// Modelo de teste grátis ("demo"): demo_inicio + demo_expira_em.
//  - conta em teste  → demo_expira_em preenchido e no futuro
//  - teste expirado  → demo_expira_em no passado
//  - conta paga/ativa → demo_expira_em nulo

export interface Empresa {
  id: string;
  user_id: string;
  email: string | null;
  nome_empresa: string | null;
  nome_responsavel: string | null;
  telefone: string | null;
  plano: string | null; // bronze | prata | ouro | diamante
  // IA / Alice
  nome_ia: string | null;
  personalidade_ia: string | null;
  tom_de_voz: string | null;
  segmento: string | null;
  produtos_servicos: string | null;
  publico_alvo: string | null;
  objetivo_ia: string | null;
  horario_atendimento: string | null;
  saudacao_inicial: string | null;
  instrucoes_extras: string | null;
  // WhatsApp / UAZAPI
  whatsapp_numero: string | null;
  uazapi_instance: string | null;
  uazapi_token: string | null;
  uazapi_status: string | null;
  // fluxo
  onboarding_completo: boolean | null;
  termos_aceitos: boolean | null;
  termos_aceitos_em: string | null;
  demo_inicio: string | null;
  demo_expira_em: string | null;
  feedback_enviado: boolean | null;
  // admin / liberações
  is_admin: boolean | null;
  /** Seções liberadas manualmente pelo admin (SectionId[]) além do plano */
  recursos_liberados: string[] | null;
  created_at: string;
  [key: string]: unknown;
}

export async function getEmpresaAtual(): Promise<Empresa | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar empresa:", error.message);
    return null;
  }
  return data as Empresa | null;
}

export interface TrialInfo {
  emTrial: boolean;
  expirado: boolean;
  diasRestantes: number;
  horasRestantes: number;
}

/** Estado do teste grátis a partir de demo_expira_em. */
export function getTrialInfo(
  empresa: Pick<Empresa, "demo_expira_em">
): TrialInfo {
  if (!empresa.demo_expira_em) {
    return { emTrial: false, expirado: false, diasRestantes: 0, horasRestantes: 0 };
  }
  const fim = new Date(empresa.demo_expira_em).getTime();
  const ms = fim - Date.now();
  const expirado = ms <= 0;
  return {
    emTrial: !expirado,
    expirado,
    diasRestantes: Math.max(0, Math.ceil(ms / 86_400_000)),
    horasRestantes: Math.max(0, Math.ceil(ms / 3_600_000)),
  };
}

/** Rótulo de status para exibição (trial | expirado | ativo). */
export function getStatusLabel(empresa: Pick<Empresa, "demo_expira_em">): string {
  if (!empresa.demo_expira_em) return "ativo";
  return new Date(empresa.demo_expira_em).getTime() > Date.now() ? "trial" : "expirado";
}
