"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Instagram, Facebook, CalendarClock } from "lucide-react";
import {
  ETAPAS,
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
  const [, startTransition] = useTransition();

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
    <div className="flex gap-4 overflow-x-auto pb-4">
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
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    className={`cursor-grab rounded-xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition hover:shadow-glass active:cursor-grabbing ${
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
  );
}
