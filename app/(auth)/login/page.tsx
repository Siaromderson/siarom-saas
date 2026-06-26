"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, type ActionState } from "../actions";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card h-72 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/crm";
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signIn,
    {}
  );

  return (
    <div className="card p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Entrar</h1>
      <p className="mt-1 text-sm text-slate-500">
        Acesse o CRM da sua empresa.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Senha"
          name="senha"
          type="password"
          autoComplete="current-password"
        />

        {state.error && <ErrorMsg>{state.error}</ErrorMsg>}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-600 hover:text-brand-700">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
      />
    </label>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
      {children}
    </p>
  );
}
