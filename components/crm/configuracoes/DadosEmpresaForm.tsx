"use client";

import { useActionState, useState } from "react";
import { Loader2, Check, Clock, Info } from "lucide-react";
import {
  salvarDadosEmpresa,
  type SaveResult,
} from "@/app/crm/configuracoes/actions";
import type { Empresa } from "@/lib/empresaContext";
import { ServicosEditor, type Servico } from "./ServicosEditor";

interface Campo {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
}

// Mesmos campos do onboarding (produtos_servicos vira lista estruturada à parte).
const CAMPOS: Campo[] = [
  { name: "nome_empresa", label: "Nome da empresa", required: true, placeholder: "Ex.: Padaria do João" },
  { name: "nome_responsavel", label: "Responsável", placeholder: "Seu nome" },
  { name: "telefone", label: "Telefone de contato", placeholder: "(69) 99999-9999" },
  { name: "segmento", label: "Segmento", placeholder: "Ex.: Alimentação, Saúde, Varejo" },
  { name: "horario_atendimento", label: "Horário de atendimento", placeholder: "Ex.: Seg a Sex, 8h às 18h" },
  { name: "publico_alvo", label: "Público-alvo", placeholder: "Quem são seus clientes?" },
  { name: "nome_ia", label: "Nome da assistente", placeholder: "Alice" },
  { name: "tom_de_voz", label: "Tom de voz", placeholder: "Ex.: amigável, formal, descontraído" },
  { name: "personalidade_ia", label: "Personalidade da IA", textarea: true, placeholder: "Como a Alice deve se comportar? Ex.: simpática, objetiva, prestativa" },
  { name: "objetivo_ia", label: "Objetivo da IA", textarea: true, placeholder: "Ex.: agendar consultas, qualificar leads, tirar dúvidas" },
  { name: "saudacao_inicial", label: "Saudação inicial", textarea: true, placeholder: "Ex.: Oi! Sou a Alice, assistente da Padaria do João. Como posso ajudar?" },
  { name: "instrucoes_extras", label: "Instruções extras", textarea: true, placeholder: "Regras, o que a Alice NÃO deve fazer..." },
];

function servicosIniciais(empresa: Empresa): Servico[] {
  const raw = empresa.servicos;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => ({
      nome: String((s as Servico)?.nome ?? "").trim(),
      valor: String((s as Servico)?.valor ?? "").trim(),
    }))
    .filter((s) => s.nome || s.valor);
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30";

const TEMPO_MIN = 10;
const TEMPO_MAX = 60;
const TEMPO_PADRAO = 20;

function clampTempo(v: number): number {
  if (!Number.isFinite(v)) return TEMPO_PADRAO;
  return Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, Math.round(v)));
}

/** Tempo (em segundos) que a Alice aguarda antes de responder: 10 a 60. */
function TempoRespostaField({ empresa }: { empresa: Empresa }) {
  const inicial = clampTempo(Number(empresa.tempo_resposta_ia ?? TEMPO_PADRAO));
  const [tempo, setTempo] = useState(inicial);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="tempo_resposta_ia"
          className="flex items-center gap-2 text-sm font-medium text-slate-700"
        >
          <Clock className="h-4 w-4 text-brand-600" />
          Tempo de resposta da IA
        </label>
        <span className="inline-flex items-center rounded-lg bg-brand-gradient px-2.5 py-1 text-sm font-bold text-white shadow-sm">
          {tempo}s
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <input
          id="tempo_resposta_ia"
          name="tempo_resposta_ia"
          type="range"
          min={TEMPO_MIN}
          max={TEMPO_MAX}
          step={1}
          value={tempo}
          onChange={(e) => setTempo(clampTempo(Number(e.target.value)))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
        />
        <input
          type="number"
          min={TEMPO_MIN}
          max={TEMPO_MAX}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          onBlur={(e) => setTempo(clampTempo(Number(e.target.value)))}
          aria-label="Tempo de resposta da IA em segundos"
          className="w-20 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{TEMPO_MIN}s</span>
        <span>{TEMPO_MAX}s</span>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
        Quanto maior o tempo de resposta, melhor a Alice interpreta mensagens com
        múltiplos áudios e textos seguidos, tornando o atendimento mais humanizado.
      </p>
    </div>
  );
}

export function DadosEmpresaForm({ empresa }: { empresa: Empresa }) {
  const [state, formAction, pending] = useActionState<SaveResult, FormData>(
    salvarDadosEmpresa,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {CAMPOS.map((c) => (
          <div key={c.name} className={c.textarea ? "sm:col-span-2" : ""}>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              {c.label}
              {c.required && <span className="text-accent-600"> *</span>}
            </label>
            {c.textarea ? (
              <textarea
                name={c.name}
                rows={3}
                placeholder={c.placeholder}
                defaultValue={(empresa[c.name] as string) ?? ""}
                className={fieldClass}
              />
            ) : (
              <input
                name={c.name}
                type="text"
                required={c.required}
                placeholder={c.placeholder}
                defaultValue={(empresa[c.name] as string) ?? ""}
                className={fieldClass}
              />
            )}
          </div>
        ))}
      </div>

      <ServicosEditor inicial={servicosIniciais(empresa)} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          Observações sobre produtos/serviços
        </label>
        <textarea
          name="produtos_servicos"
          rows={3}
          placeholder="Detalhes extras: combos, condições, diferenciais... (opcional)"
          defaultValue={(empresa.produtos_servicos as string) ?? ""}
          className={fieldClass}
        />
      </div>

      <TempoRespostaField empresa={empresa} />

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-500/10 px-4 py-2.5 text-sm text-accent-600">
          <Check className="h-4 w-4" /> Dados salvos com sucesso.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
      </button>
    </form>
  );
}
