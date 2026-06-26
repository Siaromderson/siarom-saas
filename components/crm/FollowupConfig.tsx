"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Send,
  Clock,
  CalendarDays,
  Sparkles,
  Pencil,
  AlertTriangle,
  Check,
} from "lucide-react";
import { salvarFollowup } from "@/app/crm/followup/actions";
import {
  MAX_CADENCIAS,
  UNIDADES,
  CADENCIAS_PADRAO,
  HORARIO_INICIO_RECOMENDADO,
  HORARIO_FIM_RECOMENDADO,
  foraDoRecomendado,
  type Cadencia,
  type FollowupConfig as Config,
  type Unidade,
  type ModoMensagem,
} from "@/lib/followup";

export function FollowupConfig({ inicial }: { inicial: Config }) {
  const [cfg, setCfg] = useState<Config>(inicial);
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  // Atualiza a config, descartando o "salvo" anterior.
  function patch(p: Partial<Config>) {
    setCfg((c) => ({ ...c, ...p }));
    setSalvo(false);
  }
  function patchCadencia(i: number, p: Partial<Cadencia>) {
    setCfg((c) => ({
      ...c,
      cadencias: c.cadencias.map((cad, idx) => (idx === i ? { ...cad, ...p } : cad)),
    }));
    setSalvo(false);
  }
  function adicionarCadencia() {
    if (cfg.cadencias.length >= MAX_CADENCIAS) return;
    const padrao = CADENCIAS_PADRAO[cfg.cadencias.length] ?? CADENCIAS_PADRAO[0];
    patch({ cadencias: [...cfg.cadencias, { ...padrao }] });
  }
  function removerCadencia(i: number) {
    patch({ cadencias: cfg.cadencias.filter((_, idx) => idx !== i) });
  }

  const horarioForaPadrao = foraDoRecomendado(cfg.horario_inicio, cfg.horario_fim);

  function onSalvar() {
    setErro(null);
    start(async () => {
      const res = await salvarFollowup(cfg);
      if (res.error) setErro(res.error);
      else setSalvo(true);
    });
  }

  return (
    <div className="space-y-6">
      {/* Liga/desliga geral */}
      <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Follow-up automático
            </h2>
            <p className="text-sm text-slate-500">
              A Alice reengaja leads parados seguindo as cadências abaixo.
            </p>
          </div>
        </div>
        <Toggle
          checked={cfg.ativo}
          onChange={(v) => patch({ ativo: v })}
          label="Ativar follow-up"
        />
      </section>

      {/* 1) Cadências */}
      <section className="card p-6">
        <header className="mb-1 flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-600" />
          <h2 className="font-display text-lg font-bold text-slate-900">Cadências</h2>
        </header>
        <p className="mb-5 text-sm text-slate-500">
          Até {MAX_CADENCIAS} tentativas. O intervalo é contado a partir da última
          interação do lead (cadência&nbsp;1) ou da tentativa anterior.
        </p>

        <div className="space-y-4">
          {cfg.cadencias.map((cad, i) => (
            <CadenciaCard
              key={i}
              indice={i}
              cad={cad}
              onChange={(p) => patchCadencia(i, p)}
              onRemover={cfg.cadencias.length > 1 ? () => removerCadencia(i) : undefined}
            />
          ))}
        </div>

        {cfg.cadencias.length < MAX_CADENCIAS && (
          <button
            onClick={adicionarCadencia}
            className="btn-glass mt-4"
            type="button"
          >
            <Plus className="h-4 w-4" /> Adicionar cadência
          </button>
        )}
      </section>

      {/* 2) Regras de envio */}
      <section className="card p-6">
        <header className="mb-5 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-brand-600" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            Regras de envio
          </h2>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/40 p-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Enviar no fim de semana</p>
            <p className="text-xs text-slate-500">
              Sábado e domingo. Desativado por padrão.
            </p>
          </div>
          <Toggle
            checked={cfg.enviar_fim_de_semana}
            onChange={(v) => patch({ enviar_fim_de_semana: v })}
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/60 bg-white/40 p-4">
          <p className="text-sm font-medium text-slate-800">Horário de envio</p>
          <p className="mb-3 text-xs text-slate-500">
            Recomendado: {HORARIO_INICIO_RECOMENDADO} às {HORARIO_FIM_RECOMENDADO}.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <HoraCampo
              label="Das"
              value={cfg.horario_inicio}
              onChange={(v) => patch({ horario_inicio: v })}
            />
            <HoraCampo
              label="Até"
              value={cfg.horario_fim}
              onChange={(v) => patch({ horario_fim: v })}
            />
          </div>

          {horarioForaPadrao && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Horário fora do intervalo recomendado ({HORARIO_INICIO_RECOMENDADO}–
                {HORARIO_FIM_RECOMENDADO}). Enviar muito cedo ou após as 21:00 pode
                incomodar o lead e reduzir a resposta.
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Barra de salvar */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3">
        {erro && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {erro}
          </p>
        )}
        {salvo && !pending && (
          <p className="inline-flex items-center gap-1.5 rounded-xl border border-accent-400/40 bg-accent-500/10 px-4 py-2.5 text-sm font-medium text-accent-600">
            <Check className="h-4 w-4" /> Alterações salvas
          </p>
        )}
        <button
          onClick={onSalvar}
          disabled={pending}
          className="btn-primary shadow-lg shadow-brand-700/20"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}

// ---- Card de uma cadência ----
function CadenciaCard({
  indice,
  cad,
  onChange,
  onRemover,
}: {
  indice: number;
  cad: Cadencia;
  onChange: (p: Partial<Cadencia>) => void;
  onRemover?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        cad.ativo ? "border-brand-200/70 bg-white/55" : "border-white/50 bg-white/30 opacity-70"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
            {indice + 1}
          </span>
          <span className="font-display text-sm font-bold text-slate-900">
            Cadência {indice + 1}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={cad.ativo} onChange={(v) => onChange({ ativo: v })} small />
          {onRemover && (
            <button
              type="button"
              onClick={onRemover}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Remover cadência"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Intervalo */}
      <div className="mt-4">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Enviar após
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={cad.valor}
            onChange={(e) => onChange({ valor: Math.max(1, Number(e.target.value) || 1) })}
            className="w-24 rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60"
          />
          <select
            value={cad.unidade}
            onChange={(e) => onChange({ unidade: e.target.value as Unidade })}
            className="rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60"
          >
            {UNIDADES.map((u) => (
              <option key={u.id} value={u.id}>
                {cad.valor === 1 ? u.singular : u.plural}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3) Mensagem: automática (IA) ou personalizada */}
      <div className="mt-4">
        <span className="mb-2 block text-sm font-medium text-slate-600">Mensagem</span>
        <div className="flex flex-wrap gap-2">
          <ModoBtn
            ativo={cad.modo === "auto"}
            onClick={() => onChange({ modo: "auto" })}
            icon={<Sparkles className="h-4 w-4" />}
            titulo="Automático"
            desc="A IA gera com base na conversa"
          />
          <ModoBtn
            ativo={cad.modo === "personalizado"}
            onClick={() => onChange({ modo: "personalizado" })}
            icon={<Pencil className="h-4 w-4" />}
            titulo="Personalizado"
            desc="Você escreve a mensagem"
          />
        </div>

        {cad.modo === "personalizado" && (
          <textarea
            rows={3}
            value={cad.mensagem}
            onChange={(e) => onChange({ mensagem: e.target.value })}
            placeholder="Ex.: Oi! Vi que você se interessou pela proposta. Posso te ajudar com alguma dúvida?"
            className="mt-3 w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60"
          />
        )}
      </div>
    </div>
  );
}

function ModoBtn({
  ativo,
  onClick,
  icon,
  titulo,
  desc,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 min-w-[10rem] items-start gap-2.5 rounded-xl border p-3 text-left transition ${
        ativo
          ? "border-brand-400 bg-brand-500/10 ring-1 ring-brand-400/40"
          : "border-white/60 bg-white/40 hover:border-brand-200"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          ativo ? "bg-brand-gradient text-white" : "bg-white/70 text-slate-500"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{titulo}</span>
        <span className="block text-xs text-slate-500">{desc}</span>
      </span>
    </button>
  );
}

// ---- Campo de hora (HH:MM) ----
function HoraCampo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60 [color-scheme:light]"
      />
    </label>
  );
}

// ---- Toggle (switch) ----
function Toggle({
  checked,
  onChange,
  label,
  small,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  small?: boolean;
}) {
  const w = small ? "h-5 w-9" : "h-6 w-11";
  const knob = small ? "h-3.5 w-3.5" : "h-4 w-4";
  const shift = small ? "translate-x-4" : "translate-x-5";
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative ${w} shrink-0 rounded-full transition ${
          checked ? "bg-brand-gradient" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-1/2 -translate-y-1/2 ${knob} rounded-full bg-white shadow transition ${
            checked ? shift : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
