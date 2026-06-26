"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";

export interface WhatsappResult {
  error?: string;
  ok?: boolean;
  conectado?: boolean;
}

export interface SaveResult {
  error?: string;
  ok?: boolean;
}

// Campos de texto da empresa (mesmos do onboarding).
const CAMPOS_EMPRESA = [
  "nome_empresa",
  "nome_responsavel",
  "telefone",
  "segmento",
  "horario_atendimento",
  "publico_alvo",
  "nome_ia",
  "tom_de_voz",
  "personalidade_ia",
  "produtos_servicos",
  "objetivo_ia",
  "saudacao_inicial",
  "instrucoes_extras",
] as const;

export interface Servico {
  nome: string;
  valor: string;
}

function parseServicos(raw: string): Servico[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((s) => ({
        nome: String(s?.nome ?? "").trim(),
        valor: String(s?.valor ?? "").trim(),
      }))
      .filter((s) => s.nome || s.valor);
  } catch {
    return [];
  }
}

/**
 * Salva os dados da empresa (aba "Dados da empresa"): campos de texto do
 * onboarding + lista estruturada de produtos/serviços.
 */
export async function salvarDadosEmpresa(
  _prev: SaveResult,
  formData: FormData
): Promise<SaveResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const nome = String(formData.get("nome_empresa") || "").trim();
  if (!nome) return { error: "Informe o nome da empresa." };

  const dados: Record<string, unknown> = {};
  for (const c of CAMPOS_EMPRESA) {
    dados[c] = String(formData.get(c) || "").trim() || null;
  }
  dados.servicos = parseServicos(String(formData.get("servicos") || "[]"));

  // Tempo de resposta da IA: 10 a 60 segundos (padrão 20). Limita a faixa.
  const tempoRaw = Number(formData.get("tempo_resposta_ia"));
  dados.tempo_resposta_ia = Number.isFinite(tempoRaw)
    ? Math.min(60, Math.max(10, Math.round(tempoRaw)))
    : 20;

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update(dados)
    .eq("id", empresa.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };
  revalidatePath("/crm/configuracoes");
  return { ok: true };
}

export interface QrResult {
  error?: string;
  /** QR Code já em data URL (data:image/png;base64,...) */
  qrcode?: string;
  /** já está conectado (não precisa de QR) */
  conectado?: boolean;
}

// Nome determinístico da instância da empresa (a URL/servidor é sempre o mesmo).
function nomeInstancia(empresaId: string): string {
  return `siarom_${empresaId.replace(/-/g, "").slice(0, 16)}`;
}

function pickStr(...vals: unknown[]): string | null {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function ehConectado(json: Record<string, unknown>): boolean {
  const estado =
    (json?.status as string) ??
    ((json?.instance as Record<string, unknown>)?.status as string) ??
    (json?.connection as string) ??
    (json?.state as string) ??
    "";
  return (
    /open|connected|conectado|online/i.test(String(estado)) ||
    json?.connected === true
  );
}

/**
 * Gera (e exibe) o QR Code da UAZAPI para o cliente conectar o WhatsApp.
 * Automação: cria a instância da empresa no servidor padrão (UAZAPI_SERVER_URL)
 * usando o token de admin (UAZAPI_ADMIN_TOKEN), depois pede o QR Code.
 * A URL é sempre a mesma — o cliente só escaneia.
 */
export async function gerarQrcode(): Promise<QrResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const base = (process.env.UAZAPI_SERVER_URL || "").replace(/\/+$/, "");
  const adminToken = process.env.UAZAPI_ADMIN_TOKEN || "";
  if (!base) return { error: "UAZAPI_SERVER_URL não configurada no servidor." };

  const supabase = await createClient();
  let token = (empresa.uazapi_token as string | null) || null;
  let instance =
    (empresa.uazapi_instance as string | null) || nomeInstancia(empresa.id);

  // 1) Garante que a instância existe (cria com o token de admin)
  if (!token) {
    if (!adminToken) {
      return { error: "UAZAPI_ADMIN_TOKEN não configurado no servidor." };
    }
    try {
      const res = await fetch(`${base}/instance/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          admintoken: adminToken,
        },
        body: JSON.stringify({ name: instance }),
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      const inst = (json?.instance as Record<string, unknown>) ?? {};
      token = pickStr(json.token, inst.token, json.hash, json.apikey, inst.apikey);
      instance = pickStr(inst.name, json.name, instance) || instance;
      if (!token) {
        return {
          error:
            "A UAZAPI não retornou o token da instância. Verifique o UAZAPI_ADMIN_TOKEN.",
        };
      }
      await supabase
        .from("empresas")
        .update({ uazapi_token: token, uazapi_instance: instance })
        .eq("id", empresa.id);
    } catch {
      return { error: "Não foi possível criar a instância na UAZAPI." };
    }
  }

  // 2) Pede a conexão / QR Code com o token da instância
  try {
    const res = await fetch(`${base}/instance/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: token! },
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const inst = (json?.instance as Record<string, unknown>) ?? {};

    if (ehConectado(json)) {
      await supabase
        .from("empresas")
        .update({ uazapi_status: "conectado" })
        .eq("id", empresa.id);
      return { conectado: true };
    }

    let qr = pickStr(
      json.qrcode,
      inst.qrcode,
      json.base64,
      json.qr,
      (json.qrcode as Record<string, unknown>)?.base64
    );
    if (!qr) {
      return {
        error:
          "QR Code ainda não disponível. Aguarde alguns segundos e tente novamente.",
      };
    }
    if (!qr.startsWith("data:")) qr = `data:image/png;base64,${qr}`;

    await supabase
      .from("empresas")
      .update({ uazapi_status: "aguardando_qr" })
      .eq("id", empresa.id);

    return { qrcode: qr };
  } catch {
    return { error: "Não foi possível gerar o QR Code. Tente novamente." };
  }
}

// Verifica o status da conexão consultando a UAZAPI e persiste em uazapi_status.
// A URL base da UAZAPI vem da env UAZAPI_SERVER_URL (servidor único da Siarom).
export async function verificarConexao(): Promise<WhatsappResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const base = (process.env.UAZAPI_SERVER_URL || "").replace(/\/+$/, "");
  const instancia = empresa.uazapi_instance as string | null;
  const token = empresa.uazapi_token as string | null;

  if (!base) {
    return { error: "UAZAPI_SERVER_URL não configurada no servidor." };
  }
  if (!token) {
    return { error: "Salve o token da UAZAPI primeiro." };
  }

  let conectado = false;
  try {
    const res = await fetch(`${base}/instance/status`, {
      headers: { token, ...(instancia ? { instance: instancia } : {}) },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    const estado =
      json?.status ?? json?.instance?.status ?? json?.connection ?? json?.state ?? "";
    conectado =
      /open|connected|conectado|online|true/i.test(String(estado)) ||
      json?.connected === true;
  } catch {
    return { error: "Não foi possível contatar a UAZAPI. Verifique as credenciais." };
  }

  const supabase = await createClient();
  await supabase
    .from("empresas")
    .update({ uazapi_status: conectado ? "conectado" : "desconectado" })
    .eq("id", empresa.id);

  revalidatePath("/crm/configuracoes");
  return { ok: true, conectado };
}

// Desconecta a sessão do WhatsApp na UAZAPI (logout do aparelho) e marca
// a empresa como desconectada. A instância/token são preservados.
export async function desconectarWhatsapp(): Promise<WhatsappResult> {
  const empresa = await getEmpresaAtual();
  if (!empresa) return { error: "Não autenticado." };

  const base = (process.env.UAZAPI_SERVER_URL || "").replace(/\/+$/, "");
  const token = empresa.uazapi_token as string | null;
  const instancia = empresa.uazapi_instance as string | null;

  if (!base) return { error: "UAZAPI_SERVER_URL não configurada no servidor." };
  if (!token) return { error: "Nenhuma instância para desconectar." };

  try {
    await fetch(`${base}/instance/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token, ...(instancia ? { instance: instancia } : {}) },
      cache: "no-store",
    });
  } catch {
    return { error: "Não foi possível contatar a UAZAPI. Tente novamente." };
  }

  const supabase = await createClient();
  await supabase
    .from("empresas")
    .update({ uazapi_status: "desconectado" })
    .eq("id", empresa.id);

  revalidatePath("/crm/configuracoes");
  return { ok: true, conectado: false };
}
