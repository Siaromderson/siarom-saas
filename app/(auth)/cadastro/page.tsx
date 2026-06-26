"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Sparkles, KeyRound } from "lucide-react";
import { signUp, type ActionState } from "../actions";

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="card h-96 animate-pulse" />}>
      <CadastroForm />
    </Suspense>
  );
}

function CadastroForm() {
  const params = useSearchParams();
  const chavePreenchida = params.get("chave") || "";
  const [modo, setModo] = useState<"trial" | "chave">(
    chavePreenchida ? "chave" : "trial"
  );
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    {}
  );

  return (
    <div className="card p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Criar conta</h1>
      <p className="mt-1 text-sm text-slate-500">
        Comece grátis ou ative seu plano pago.
      </p>

      {/* Seletor de modo */}
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <ModeButton
          active={modo === "trial"}
          onClick={() => setModo("trial")}
          icon={<Sparkles className="h-4 w-4" />}
          label="Teste 7 dias"
        />
        <ModeButton
          active={modo === "chave"}
          onClick={() => setModo("chave")}
          icon={<KeyRound className="h-4 w-4" />}
          label="Tenho chave"
        />
      </div>

      {modo === "trial" ? (
        <p className="mt-4 rounded-xl border border-brand-200 bg-brand-500/10 px-4 py-3 text-sm text-brand-700">
          7 dias grátis com todos os recursos do plano <b>Ouro</b>. Sem cartão.
        </p>
      ) : (
        <p className="mt-4 rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm text-accent-600">
          Use a chave enviada por email após o pagamento.
        </p>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="modo" value={modo} />

        {modo === "chave" && (
          <Field
            label="Chave de ativação"
            name="chave"
            type="text"
            defaultValue={chavePreenchida}
            placeholder="SIAROM-XXXX-XXXX-XXXX"
          />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />

        {state.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : modo === "trial" ? (
            "Começar teste grátis"
          ) : (
            "Ativar minha conta"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-brand-gradient text-white shadow"
          : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
      />
    </label>
  );
}
