"use client";

import { useActionState, useState } from "react";
import { Loader2, Check, Sparkles, Pencil, AlertTriangle } from "lucide-react";
import { salvarFollowup, type SaveResult } from "@/app/crm/configuracoes/actions";
import {
  UNIDADES,
  intervaloLabel,
  foraDoRecomendado,
  type FollowupConfig,
  type Cadencia,
  type Unidade,
  type ModoMensagem,
} from "@/lib/followup";

const fieldClass =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30";

function ModoToggle({
  modo,
  onChange,
}: {
  modo: ModoMensagem;
  onChange: (m: ModoMensagem) => void;
}) {
  const opcoes: { id: ModoMensagem; label: string; Icon: typeof Sparkles }[] = [
    { id: "auto", label: "Automático (IA)", Icon: Sparkles },
    { id: "personalizado", label: "Personalizado", Icon: Pencil },
  ];
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
      {opcoes.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            modo === id
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function FollowupPanel({ inicial }: { inicial: FollowupConfig }) {
  const [cfg, setCfg] = useState<FollowupConfig>(inicial);
  const [state, formAction, pending] = useActionState<SaveResult, FormData>(
    salvarFollowup,
    {}
  );

  function setCadencia(i: number, patch: Partial<Cadencia>) {
    setCfg((c) => ({
      ...c,
      cadencias: c.cadencias.map((cad, idx) =>
        idx === i ? { ...cad, ...patch } : cad
      ),
    }));
  }

  const aviso = foraDoRecomendado(cfg.horario_inicio, cfg.horario_fim);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="config" value={JSON.stringify(cfg)} />

      {/* Configuração global */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Follow-up automático
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A Alice reengaja sozinha quem parou de responder.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              {cfg.ativo ? "Ativado" : "Desativado"}
            </span>
            <input
              type="checkbox"
              checked={cfg.ativo}
              onChange={(e) => setCfg((c) => ({ ...c, ativo: e.target.checked }))}
              className="peer sr-only"
            />
            <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Regras de envio */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Enviar a partir de
            </label>
            <input
              type="time"
              value={cfg.horario_inicio}
              onChange={(e) => setCfg((c) => ({ ...c, horario_inicio: e.target.value }))}
              className={`${fieldClass} w-full`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Enviar até
            </label>
            <input
              type="time"
              value={cfg.horario_fim}
              onChange={(e) => setCfg((c) => ({ ...c, horario_fim: e.target.value }))}
              className={`${fieldClass} w-full`}
            />
          </div>
          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={cfg.enviar_fim_de_semana}
              onChange={(e) =>
                setCfg((c) => ({ ...c, enviar_fim_de_semana: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-600">Enviar fim de semana</span>
          </label>
        </div>

        {aviso && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Recomendamos enviar entre 07:00 e 21:00 para não incomodar os clientes.
          </p>
        )}
      </section>

      {/* Cadências */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Cadências</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          Quando e como cada mensagem de follow-up é enviada após o último contato.
        </p>

        <div className="space-y-4">
          {cfg.cadencias.map((cad, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 transition ${
                cad.ativo ? "border-slate-200 bg-white/50" : "border-slate-200 bg-slate-50/60 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {i + 1}ª mensagem
                    </p>
                    <p className="text-xs text-slate-500">
                      {cad.ativo ? `${intervaloLabel(cad)} após o último contato` : "Desativada"}
                    </p>
                  </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cad.ativo}
                    onChange={(e) => setCadencia(i, { ativo: e.target.checked })}
                    className="peer sr-only"
                  />
                  <span className="relative h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                </label>
              </div>

              {cad.ativo && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-slate-600">Enviar após</span>
                    <input
                      type="number"
                      min={1}
                      value={cad.valor}
                      onChange={(e) =>
                        setCadencia(i, { valor: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className={`${fieldClass} w-20`}
                    />
                    <select
                      value={cad.unidade}
                      onChange={(e) => setCadencia(i, { unidade: e.target.value as Unidade })}
                      className={fieldClass}
                    >
                      {UNIDADES.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.plural}
                        </option>
                      ))}
                    </select>

                    <span className="ml-auto">
                      <ModoToggle
                        modo={cad.modo}
                        onChange={(m) => setCadencia(i, { modo: m })}
                      />
                    </span>
                  </div>

                  {cad.modo === "personalizado" ? (
                    <textarea
                      value={cad.mensagem}
                      onChange={(e) => setCadencia(i, { mensagem: e.target.value })}
                      rows={3}
                      placeholder="Escreva a mensagem. Use {nome} para o nome do contato."
                      className={`${fieldClass} w-full`}
                    />
                  ) : (
                    <p className="flex items-center gap-2 rounded-xl bg-brand-500/5 px-4 py-2.5 text-sm text-slate-500">
                      <Sparkles className="h-4 w-4 text-brand-500" />
                      A Alice escreve a mensagem automaticamente, no tom de voz da empresa.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-500/10 px-4 py-2.5 text-sm text-accent-600">
          <Check className="h-4 w-4" /> Follow-up salvo com sucesso.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar follow-up"}
      </button>
    </form>
  );
}
