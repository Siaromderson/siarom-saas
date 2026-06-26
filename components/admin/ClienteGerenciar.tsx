"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Lock, Unlock, ShieldCheck } from "lucide-react";
import {
  SECTIONS,
  SECTION_ORDER,
  PLANO_RANK,
  temAcesso,
  type PlanoId,
} from "@/lib/features";
import { PLANS, getPlan } from "@/lib/plans";
import {
  atualizarPlano,
  toggleRecurso,
  definirAdmin,
} from "@/app/admin/actions";

interface Props {
  empresaId: string;
  planoInicial: string;
  recursosIniciais: string[];
  isAdminInicial: boolean;
}

export function ClienteGerenciar({
  empresaId,
  planoInicial,
  recursosIniciais,
  isAdminInicial,
}: Props) {
  const [plano, setPlano] = useState<string>(planoInicial || "bronze");
  const [recursos, setRecursos] = useState<string[]>(recursosIniciais);
  const [admin, setAdmin] = useState<boolean>(isAdminInicial);
  const [pendingPlano, startPlano] = useTransition();
  const [pendingRecurso, startRecurso] = useTransition();
  const [pendingAdmin, startAdmin] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function mudarPlano(novo: string) {
    setPlano(novo);
    setMsg(null);
    startPlano(async () => {
      const res = await atualizarPlano(empresaId, novo);
      setMsg(res.error ? `Erro: ${res.error}` : "Plano atualizado.");
    });
  }

  function alternarRecurso(sectionId: string) {
    const otimista = recursos.includes(sectionId)
      ? recursos.filter((s) => s !== sectionId)
      : [...recursos, sectionId];
    setRecursos(otimista);
    setMsg(null);
    startRecurso(async () => {
      const res = await toggleRecurso(empresaId, sectionId);
      if (res.error) {
        setRecursos(recursos); // reverte
        setMsg(`Erro: ${res.error}`);
      }
    });
  }

  function alternarAdmin() {
    const novo = !admin;
    setAdmin(novo);
    startAdmin(async () => {
      const res = await definirAdmin(empresaId, novo);
      if (res.error) {
        setAdmin(!novo);
        setMsg(`Erro: ${res.error}`);
      } else setMsg(novo ? "Promovido a admin." : "Acesso admin removido.");
    });
  }

  const empresaSim = { plano, recursos_liberados: recursos };

  return (
    <div className="space-y-6">
      {/* Plano */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Plano</h2>
        <p className="mt-1 mb-4 text-sm text-slate-500">
          Define quais seções o cliente acessa automaticamente.
        </p>
        <div className="flex flex-wrap gap-2">
          {PLANS.map((p) => {
            const ativo = plano === p.id;
            return (
              <button
                key={p.id}
                onClick={() => mudarPlano(p.id)}
                disabled={pendingPlano}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition disabled:opacity-60 ${
                  ativo
                    ? "bg-brand-gradient text-white shadow-lg shadow-brand-700/20"
                    : "border border-white/60 bg-white/60 text-slate-600 backdrop-blur-md hover:bg-white/80"
                }`}
              >
                {p.name}
              </button>
            );
          })}
          {pendingPlano && (
            <Loader2 className="h-4 w-4 animate-spin self-center text-brand-600" />
          )}
        </div>
      </section>

      {/* Liberação de seções */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Funções (seções do CRM)
        </h2>
        <p className="mt-1 mb-4 text-sm text-slate-500">
          Ative o cadeado aberto para liberar uma seção além do plano atual.
        </p>
        <div className="space-y-2">
          {SECTION_ORDER.map((id) => {
            const sec = SECTIONS[id];
            const incluidoPlano =
              PLANO_RANK[(plano as PlanoId) ?? "bronze"] >=
              PLANO_RANK[sec.minPlano];
            const liberadoManual = recursos.includes(id);
            const temAcessoFinal = temAcesso(empresaSim, id);
            const planoNome = getPlan(sec.minPlano)?.name ?? sec.minPlano;

            return (
              <div
                key={id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/50 bg-white/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-slate-900">
                    {temAcessoFinal ? (
                      <Unlock className="h-4 w-4 text-accent-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400" />
                    )}
                    {sec.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    Plano mínimo: {planoNome}
                    {incluidoPlano && " · incluso no plano atual"}
                  </p>
                </div>
                <button
                  onClick={() => alternarRecurso(id)}
                  disabled={pendingRecurso || incluidoPlano}
                  title={
                    incluidoPlano
                      ? "Já incluso pelo plano"
                      : liberadoManual
                        ? "Bloquear novamente"
                        : "Liberar manualmente"
                  }
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    liberadoManual
                      ? "bg-accent-500/15 text-accent-600"
                      : "border border-white/60 bg-white/60 text-slate-600 hover:bg-white/80"
                  }`}
                >
                  {incluidoPlano
                    ? "Incluso"
                    : liberadoManual
                      ? "Liberado"
                      : "Liberar"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Admin */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-brand-600" /> Acesso de admin
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Permite ver e gerenciar todos os clientes.
            </p>
          </div>
          <button
            onClick={alternarAdmin}
            disabled={pendingAdmin}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              admin
                ? "bg-brand-gradient text-white"
                : "border border-white/60 bg-white/60 text-slate-600 hover:bg-white/80"
            }`}
          >
            {pendingAdmin ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : admin ? (
              "É admin"
            ) : (
              "Tornar admin"
            )}
          </button>
        </div>
      </section>

      {msg && (
        <p className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-700 backdrop-blur-md">
          <Check className="h-4 w-4 text-accent-500" /> {msg}
        </p>
      )}
    </div>
  );
}
