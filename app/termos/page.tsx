import { redirect } from "next/navigation";
import Image from "next/image";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { aceitarTermos } from "./actions";
import { TermosAceite } from "./TermosAceite";

export const metadata = { title: "Termos de uso" };

export default async function TermosPage() {
  const empresa = await getEmpresaAtual();
  if (!empresa) redirect("/login");
  if (empresa.termos_aceitos) {
    redirect(empresa.onboarding_completo ? "/crm" : "/onboarding");
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2.5 font-display text-xl font-bold text-slate-900">
          <Image src="/imagens/logo.png" alt="Siarom AI" width={72} height={40} className="h-10 w-auto" />
          Siarom <span className="gradient-text">AI</span>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">Termos de uso</h1>
          <p className="mt-1 text-sm text-slate-500">
            Leia e aceite para acessar o CRM.
          </p>

          <div className="mt-5 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
            <p><b className="text-slate-900">1. Serviço.</b> A Siarom AI fornece a assistente virtual Alice e o CRM para atendimento automatizado via WhatsApp, Instagram e Facebook.</p>
            <p><b className="text-slate-900">2. Conta e dados.</b> Você é responsável pelas credenciais e pelos dados inseridos. Cada empresa acessa apenas seus próprios dados (multi-tenant).</p>
            <p><b className="text-slate-900">3. Uso aceitável.</b> É vedado utilizar o serviço para spam, conteúdo ilícito ou violação de direitos de terceiros.</p>
            <p><b className="text-slate-900">4. Pagamentos.</b> Planos pagos envolvem taxa de implementação única e mensalidade recorrente. O teste grátis dura 7 dias.</p>
            <p><b className="text-slate-900">5. Privacidade (LGPD).</b> Tratamos os dados conforme a LGPD. Conversas e contatos são usados para operar o atendimento da sua empresa.</p>
            <p><b className="text-slate-900">6. Cancelamento.</b> Você pode cancelar a qualquer momento; o acesso permanece até o fim do ciclo vigente.</p>
            <p><b className="text-slate-900">7. Limitação.</b> O serviço é fornecido &quot;como está&quot;; respostas da IA podem conter imprecisões e devem ser supervisionadas.</p>
          </div>

          <TermosAceite onAccept={aceitarTermos} />
        </div>
      </div>
    </main>
  );
}
