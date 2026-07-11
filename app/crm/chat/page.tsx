import { createClient } from "@/lib/supabase/server";
import { getEmpresaAtual } from "@/lib/empresaContext";
import { temAcesso } from "@/lib/features";
import { RecursoBloqueado } from "@/components/crm/RecursoBloqueado";
import { ChatInterativo } from "@/components/crm/chat/ChatInterativo";
import type { Chat } from "@/lib/crm";

export const metadata = { title: "Chat interativo" };

export default async function ChatPage() {
  const empresa = await getEmpresaAtual();
  if (!temAcesso(empresa!, "chat")) return <RecursoBloqueado section="chat" />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("chats")
    .select("*")
    .eq("empresa_id", empresa!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Chat interativo
        </h1>
        <p className="text-sm text-slate-500">
          Converse pelo WhatsApp direto do CRM. Envie texto, imagens, vídeos e
          documentos para os seus contatos.
        </p>
      </div>

      <ChatInterativo empresaId={empresa!.id} chats={(data ?? []) as Chat[]} />
    </div>
  );
}
