import Link from "next/link";
import { Users, MessageSquare, ChevronRight, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStatusLabel, type Empresa } from "@/lib/empresaContext";
import { getPlan } from "@/lib/plans";

export const metadata = { title: "Clientes · Admin" };

const STATUS_CLS: Record<string, string> = {
  ativo: "bg-accent-500/15 text-accent-600",
  trial: "bg-amber-100 text-amber-700",
  expirado: "bg-red-100 text-red-700",
};

export default async function AdminHome() {
  const admin = createAdminClient();

  const { data: empresasData } = await admin
    .from("empresas")
    .select("*")
    .order("created_at", { ascending: false });
  const empresas = (empresasData ?? []) as Empresa[];

  // Contagem de conversas por empresa (uma query, agregada em memória)
  const { data: chatsData } = await admin.from("chats").select("empresa_id");
  const chatsPorEmpresa = new Map<string, number>();
  for (const c of chatsData ?? []) {
    const id = (c as { empresa_id: string }).empresa_id;
    chatsPorEmpresa.set(id, (chatsPorEmpresa.get(id) ?? 0) + 1);
  }

  const totalChats = (chatsData ?? []).length;
  const totalAtivos = empresas.filter((e) => getStatusLabel(e) === "ativo").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Clientes</h1>
        <p className="text-sm text-slate-500">
          Todas as empresas da plataforma. Gerencie planos e libere funções.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Resumo icon={Users} label="Empresas" value={empresas.length} />
        <Resumo icon={ShieldCheck} label="Ativas (pagas)" value={totalAtivos} />
        <Resumo icon={MessageSquare} label="Conversas (total)" value={totalChats} />
      </div>

      {/* Lista */}
      <div className="glass overflow-hidden">
        <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_0.8fr_40px] gap-4 border-b border-white/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Empresa</span>
          <span>Plano</span>
          <span>Status</span>
          <span>Conversas</span>
          <span />
        </div>

        {empresas.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Nenhuma empresa cadastrada ainda.
          </p>
        )}

        {empresas.map((e) => {
          const status = getStatusLabel(e);
          const plano = getPlan(e.plano ?? "");
          return (
            <Link
              key={e.id}
              href={`/admin/${e.id}`}
              className="grid grid-cols-1 gap-2 border-b border-white/40 px-5 py-4 transition hover:bg-white/50 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_40px] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-semibold text-slate-900">
                  {e.nome_empresa || "Sem nome"}
                  {e.is_admin && (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
                  )}
                </p>
                <p className="truncate text-xs text-slate-500">{e.email}</p>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full border border-brand-200/60 bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-600">
                  {plano?.name ?? e.plano ?? "—"}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    STATUS_CLS[status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                {chatsPorEmpresa.get(e.id) ?? 0}
              </div>
              <ChevronRight className="hidden h-5 w-5 justify-self-end text-slate-400 sm:block" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Resumo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
