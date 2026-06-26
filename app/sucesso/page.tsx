import Link from "next/link";
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { getPlan } from "@/lib/plans";

export const metadata = { title: "Pagamento confirmado" };

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;
  const plan = plano ? getPlan(plano) : undefined;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="card w-full max-w-lg p-8 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-500/15 text-accent-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>

        <h1 className="mt-6 font-display text-3xl font-bold text-slate-900">
          Pagamento confirmado! 🎉
        </h1>
        <p className="mt-3 text-slate-600">
          Obrigado por escolher a <span className="gradient-text font-semibold">Siarom AI</span>
          {plan ? <> — plano <b className="text-slate-900">{plan.name}</b></> : null}.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-slate-600">
            Enviamos sua <b>chave de ativação</b> por email. Use-a no cadastro para
            acessar o CRM. Verifique também a caixa de spam.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/cadastro" className="btn-primary">
            Ativar minha conta
          </Link>
          <Link href="/" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
        </div>
      </div>
    </main>
  );
}
