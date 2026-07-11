import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  CalendarCheck,
  Bot,
  Wifi,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStatusLabel, type Empresa } from "@/lib/empresaContext";
import { ClienteGerenciar } from "@/components/admin/ClienteGerenciar";

export const metadata = { title: "Cliente · Admin" };

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data } = await admin.from("empresas").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const empresa = data as Empresa;

  const [{ count: nChats }, { count: nAgend }] = await Promise.all([
    admin.from("chats").select("id", { count: "exact", head: true }).eq("empresa_id", id),
    admin
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", id),
  ]);

  const status = getStatusLabel(empresa);
  const recursos = Array.isArray(empresa.recursos_liberados)
    ? (empresa.recursos_liberados as string[])
    : [];

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>

      {/* Cabeçalho do cliente */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {empresa.nome_empresa || "Sem nome"}
            </h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              {empresa.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {empresa.email}
                </span>
              )}
              {empresa.telefone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {empresa.telefone}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize bg-brand-500/10 text-brand-600">
            {status}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Mini icon={MessageSquare} label="Conversas" value={nChats ?? 0} />
          <Mini icon={CalendarCheck} label="Agendamentos" value={nAgend ?? 0} />
          <Mini
            icon={Bot}
            label="IA"
            text={empresa.nome_ia ?? "Alice"}
          />
          <Mini
            icon={Wifi}
            label="WhatsApp"
            text={empresa.uazapi_status === "conectado" ? "Conectado" : "Desconectado"}
          />
        </div>
      </div>

      <ClienteGerenciar
        empresaId={empresa.id}
        planoInicial={empresa.plano ?? "bronze"}
        recursosIniciais={recursos}
        isAdminInicial={Boolean(empresa.is_admin)}
        statusInicial={status}
        demoExpiraEm={empresa.demo_expira_em}
      />
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
  text,
}: {
  icon: typeof MessageSquare;
  label: string;
  value?: number;
  text?: string;
}) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/40 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="mt-1 font-display text-lg font-bold text-slate-900">
        {text ?? value}
      </p>
    </div>
  );
}
