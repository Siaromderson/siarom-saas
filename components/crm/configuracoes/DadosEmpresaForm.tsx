"use client";

import { useActionState } from "react";
import { Loader2, Check } from "lucide-react";
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
