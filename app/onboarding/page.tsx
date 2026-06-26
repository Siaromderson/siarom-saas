import { redirect } from "next/navigation";
import Image from "next/image";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = { title: "Configuração inicial" };

export default async function OnboardingPage() {
  const empresa = await getEmpresaAtual();
  if (!empresa) redirect("/login");
  if (!empresa.termos_aceitos) redirect("/termos");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12">
      <div className="mb-6 flex items-center justify-center gap-2.5 font-display text-xl font-bold text-slate-900">
        <Image src="/imagens/logo.png" alt="Siarom AI" width={72} height={40} className="h-10 w-auto" />
        Siarom <span className="gradient-text">AI</span>
      </div>

      <div className="card p-8">
        <span className="eyebrow">Passo final</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
          Vamos configurar a <span className="gradient-text">Alice</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Essas informações ensinam a Alice a atender como a sua empresa atende.
          Você pode editar tudo depois em Configurações.
        </p>

        <div className="mt-7">
          <OnboardingForm
            empresa={empresa}
            redirectAfter
            submitLabel="Concluir e entrar no CRM"
          />
        </div>
      </div>
    </main>
  );
}
