"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Instagram,
  Facebook,
  CalendarClock,
  X,
  Phone,
  MapPin,
  Clock,
  Milestone,
} from "lucide-react";
import {
  ETAPAS,
  ETAPA_LABEL,
  CANAL_LABEL,
  SENTIMENTO_DEF,
  formatarDataCurta,
  formatarDataCompleta,
  type Chat,
  type Etapa,
} from "@/lib/crm";
import { moverEtapa } from "@/app/crm/kanban/actions";

const CANAL_ICON: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
};

export function KanbanBoard({ chatsIniciais }: { chatsIniciais: Chat[] }) {
  const [chats, setChats] = useState<Chat[]>(chatsIniciais);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Etapa | null>(null);
  const [aberto, setAberto] = useState<Chat | null>(null);
  const [, startTransition] = useTransition();

  // Marca que houve arraste, para não abrir o modal ao soltar um card.
  // O navegador não dispara "click" após um drag-and-drop, então resetamos
  // o flag no onDragEnd (com atraso mínimo) e não em onClick.
  const arrastou = useRef(false);

  function onDrop(etapa: Etapa) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const alvo = chats.find((c) => c.id === id);
    if (!alvo || alvo.etapa === etapa) return;

    // Atualização otimista
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, etapa } : c)));
    startTransition(async () => {
      const res = await moverEtapa(id, etapa);
      if (res?.error) {
        // reverte em caso de erro
        setChats((prev) =>
          prev.map((c) => (c.id === id ? { ...c, etapa: alvo.etapa } : c))
        );
      }
    });
  }

  return (
    // Wrapper da página: trava o scroll horizontal para que a PÁGINA e o banner
    // do topo nunca se movam durante o arraste.
    <div className="overflow-x-hidden">
      {/* Container das etapas: único elemento com scroll horizontal. */}
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4">
      {ETAPAS.map((col) => {
        const cards = chats.filter((c) => (c.etapa ?? "novo_lead") === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={() => onDrop(col.id)}
            className={`flex max-h-[calc(100vh-200px)] w-72 shrink-0 flex-col rounded-2xl border backdrop-blur-md transition ${
              overCol === col.id
                ? "border-brand-500/60 bg-brand-500/10"
                : "border-white/50 bg-white/40"
            }`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/50 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                {col.label}
              </span>
              <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-slate-500">
                {cards.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
              {cards.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-600">Vazio</p>
              )}
              {cards.map((c) => {
                const Icon = CANAL_ICON[c.canal ?? "whatsapp"] ?? MessageCircle;
                const sent = c.sentimento ? SENTIMENTO_DEF[c.sentimento] : null;
                return (
                  <article
                    key={c.id}
                    draggable
                    onDragStart={() => {
                      setDragId(c.id);
                      arrastou.current = true;
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      // Libera o clique só após o ciclo de drag terminar.
                      setTimeout(() => {
                        arrastou.current = false;
                      }, 0);
                    }}
                    onClick={() => {
                      // Ignora o "clique" fantasma logo após um arraste.
                      if (arrastou.current) return;
                      setAberto(c);
                    }}
                    className={`cursor-pointer rounded-xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition hover:shadow-glass active:cursor-grabbing ${
                      dragId === c.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {c.nome || c.telefone || "Sem nome"}
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-brand-600" />
                    </div>
                    {c.ultima_interacao && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {c.ultima_interacao}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span
                        title={formatarDataCompleta(c.created_at)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/60 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                      >
                        <CalendarClock className="h-3 w-3 text-brand-500" />
                        {formatarDataCurta(c.created_at)}
                      </span>
                      {sent && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${sent.cls}`}
                        >
                          {sent.emoji} {sent.label}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>

      {aberto && <InfoCard chat={aberto} onClose={() => setAberto(null)} />}
    </div>
  );
}

function InfoCard({ chat, onClose }: { chat: Chat; onClose: () => void }) {
  const router = useRouter();
  const Icon = CANAL_ICON[chat.canal ?? "whatsapp"] ?? MessageCircle;
  const ultimoContato =
    chat.ultima_interacao || formatarDataCompleta(chat.created_at) || "—";

  function conversar() {
    // Abre a conversa deste lead na tela de Chat (Contatos), passando o id/telefone.
    const params = new URLSearchParams({ chat: chat.id });
    if (chat.telefone) params.set("telefone", chat.telefone);
    router.push(`/crm/contatos?${params.toString()}`);
  }

  const linhas: { icon: typeof Phone; label: string; valor: string }[] = [
    { icon: Phone, label: "Telefone", valor: chat.telefone || "—" },
    {
      icon: Milestone,
      label: "Etapa atual",
      valor: ETAPA_LABEL[chat.etapa ?? "novo_lead"] ?? "Novo Lead",
    },
    {
      icon: MapPin,
      label: "Origem",
      valor: CANAL_LABEL[chat.canal ?? ""] ?? chat.canal ?? "—",
    },
    { icon: Clock, label: "Último contato", valor: ultimoContato },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                {chat.nome || chat.telefone || "Sem nome"}
              </p>
              <p className="text-xs text-slate-500">Informações do contato</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 transition hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="space-y-3 px-5 py-4">
          {linhas.map((l) => (
            <div key={l.label} className="flex items-start gap-3">
              <l.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  {l.label}
                </dt>
                <dd className="break-words text-sm text-slate-800">{l.valor}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            onClick={conversar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 transition hover:opacity-95"
          >
            <MessageCircle className="h-4 w-4" />
            Conversar com o lead
          </button>
        </div>
      </div>
    </div>
  );
}
