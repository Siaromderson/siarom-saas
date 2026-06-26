import { redirect } from "next/navigation";
import { getEmpresaAtual, getTrialInfo } from "@/lib/empresaContext";
import { isAdmin } from "@/lib/admin";
import { Sidebar } from "@/components/crm/Sidebar";
import { TrialBanner } from "@/components/crm/TrialBanner";
import { TrialExpirado } from "@/components/crm/TrialExpirado";
import { FeedbackPrompt } from "@/components/crm/FeedbackPrompt";
import { TourAlice } from "@/components/crm/TourAlice";
import { signOut } from "@/app/(auth)/actions";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const empresa = await getEmpresaAtual();
  if (!empresa) redirect("/login");
  if (!empresa.termos_aceitos) redirect("/termos");
  if (!empresa.onboarding_completo) redirect("/onboarding");

  const trial = getTrialInfo(empresa);
  const bloqueado = trial.expirado;
  // Feedback no 2º dia do teste (2 dias ou menos restantes, ainda em trial e não enviado)
  const mostrarFeedback =
    trial.emTrial && trial.diasRestantes <= 2 && !empresa.feedback_enviado;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        empresaNome={empresa.nome_empresa ?? "Minha empresa"}
        plano={empresa.plano ?? "bronze"}
        recursos={
          Array.isArray(empresa.recursos_liberados) ? empresa.recursos_liberados : []
        }
        isAdmin={isAdmin(empresa)}
        signOut={signOut}
      />

      <div className="flex flex-1 flex-col lg:pl-64">
        {trial.emTrial && (
          <TrialBanner
            diasRestantes={trial.diasRestantes}
            horasRestantes={trial.horasRestantes}
          />
        )}

        <main className="flex-1 px-5 py-6 sm:px-8">
          {bloqueado ? <TrialExpirado /> : children}
        </main>
      </div>

      {mostrarFeedback && <FeedbackPrompt />}
      {!bloqueado && <TourAlice />}
    </div>
  );
}
