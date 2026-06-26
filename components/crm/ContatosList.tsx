"use client";

import { useMemo, useState } from "react";
import { Search, X, MessageCircle } from "lucide-react";
import {
  ETAPAS,
  ETAPA_LABEL,
  SENTIMENTO_DEF,
  CANAL_LABEL,
  type Chat,
  type Sentimento,
} from "@/lib/crm";

export function ContatosList({ chats }: { chats: Chat[] }) {
  const [busca, setBusca] = useState("");
  const [etapa, setEtapa] = useState("");
  const [sentimento, setSentimento] = useState("");
  const [aberto, setAberto] = useState<Chat | null>(null);

  const filtrados = useMemo(() => {
    return chats.filter((c) => {
      if (etapa && (c.etapa ?? "") !== etapa) return false;
      if (sentimento && (c.sentimento ?? "") !== sentimento) return false;
      if (busca) {
        const t = `${c.nome ?? ""} ${c.telefone ?? ""}`.toLowerCase();
        if (!t.includes(busca.toLowerCase())) return false;
      }
      return true;
    });
  }, [chats, busca, etapa, sentimento]);

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-brand-500/60"
          />
        </div>
        <select
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500/60"
        >
          <option value="">Todas as etapas</option>
          {ETAPAS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
        <select
          value={sentimento}
          onChange={(e) => setSentimento(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500/60"
        >
          <option value="">Todos sentimentos</option>
          {(Object.keys(SENTIMENTO_DEF) as Sentimento[]).map((s) => (
            <option key={s} value={s}>
              {SENTIMENTO_DEF[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="card mt-5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Contato</th>
              <th className="px-4 py-3 font-semibold">Canal</th>
              <th className="px-4 py-3 font-semibold">Etapa</th>
              <th className="px-4 py-3 font-semibold">Sentimento</th>
              <th className="px-4 py-3 font-semibold">Última interação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
            {filtrados.map((c) => {
              const sent = c.sentimento ? SENTIMENTO_DEF[c.sentimento] : null;
              return (
                <tr
                  key={c.id}
                  onClick={() => setAberto(c)}
                  className="cursor-pointer border-b border-slate-200 transition hover:bg-slate-100"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{c.nome || "Sem nome"}</p>
                    <p className="text-xs text-slate-500">{c.telefone || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {CANAL_LABEL[c.canal ?? ""] ?? c.canal ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {ETAPA_LABEL[c.etapa ?? ""] ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {sent ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${sent.cls}`}>
                        {sent.emoji} {sent.label}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {c.ultima_interacao || new Date(c.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {aberto && <HistoricoDrawer chat={aberto} onClose={() => setAberto(null)} />}
    </div>
  );
}

interface Mensagem {
  autor?: string;
  de?: string;
  role?: string;
  texto?: string;
  mensagem?: string;
  content?: string;
  at?: string;
  data?: string;
}

function parseHistorico(historico: string | null): { msgs: Mensagem[]; texto: string | null } {
  if (!historico) return { msgs: [], texto: null };
  const trimmed = historico.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return { msgs: parsed as Mensagem[], texto: null };
    } catch {
      // não é JSON válido → trata como texto puro
    }
  }
  return { msgs: [], texto: historico };
}

function HistoricoDrawer({ chat, onClose }: { chat: Chat; onClose: () => void }) {
  const { msgs, texto } = parseHistorico(chat.historico);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="font-semibold text-slate-900">{chat.nome || "Sem nome"}</p>
            <p className="text-xs text-slate-500">{chat.telefone || "—"}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {msgs.length === 0 ? (
            texto ? (
              <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {texto}
              </pre>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                <MessageCircle className="mb-2 h-8 w-8" />
                <p className="text-sm">
                  {chat.ultima_interacao || "Sem histórico de conversa disponível."}
                </p>
              </div>
            )
          ) : (
            msgs.map((m, i) => {
              const autor = m.autor || m.de || m.role || "contato";
              const ehEmpresa = /alice|assistente|ia|bot|empresa|atendente/i.test(autor);
              const texto = m.texto || m.mensagem || m.content || "";
              return (
                <div key={i} className={`flex ${ehEmpresa ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      ehEmpresa
                        ? "bg-brand-gradient text-white"
                        : "border border-slate-200 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {texto}
                    {(m.at || m.data) && (
                      <span className="mt-1 block text-[10px] opacity-70">
                        {new Date(m.at || m.data!).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
