"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Search,
  Send,
  Paperclip,
  Loader2,
  ArrowLeft,
  MessageCircle,
  FileText,
  Download,
  AlertCircle,
  Check,
  CheckCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CANAL_LABEL, formatarDataRelativa, type Chat } from "@/lib/crm";
import {
  CHAT_BUCKET,
  CHAT_MEDIA_ACCEPT,
  CHAT_MEDIA_MAX_BYTES,
  montarChatStoragePath,
  tipoMidiaChat,
  formatarHora,
  type Mensagem,
} from "@/lib/chat";
import {
  enviarMensagem,
  enviarMidiaChat,
  carregarMensagens,
} from "@/app/crm/chat/actions";

export function ChatInterativo({
  empresaId,
  chats,
}: {
  empresaId: string;
  chats: Chat[];
}) {
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState<Chat | null>(null);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) =>
      `${c.nome ?? ""} ${c.telefone ?? ""}`.toLowerCase().includes(q)
    );
  }, [chats, busca]);

  return (
    <div className="card grid h-[calc(100vh-13rem)] min-h-[520px] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[20rem_1fr]">
      {/* Lista de conversas */}
      <aside
        className={`flex min-h-0 flex-col border-r border-slate-200 ${
          ativo ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="border-b border-slate-200 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-brand-500/60"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtrados.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">
              Nenhuma conversa encontrada.
            </p>
          ) : (
            filtrados.map((c) => (
              <button
                key={c.id}
                onClick={() => setAtivo(c)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  ativo?.id === c.id ? "bg-brand-500/10" : ""
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {(c.nome || c.telefone || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {c.nome || c.telefone || "Sem nome"}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {formatarDataRelativa(c.created_at)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className="truncate text-xs text-slate-500">
                      {c.ultima_interacao || CANAL_LABEL[c.canal ?? ""] || "—"}
                    </span>
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className={`min-h-0 flex-col ${ativo ? "flex" : "hidden lg:flex"}`}>
        {ativo ? (
          <Thread
            key={ativo.id}
            chat={ativo}
            empresaId={empresaId}
            onVoltar={() => setAtivo(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
            <MessageCircle className="h-10 w-10" />
            <p className="text-sm">Selecione uma conversa para começar.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------
//  Thread da conversa selecionada
// ------------------------------------------------------------------

interface HistItem {
  id: string;
  direcao: "entrada" | "saida";
  conteudo: string;
  at: string | null;
  historico: true;
}

// Converte o campo texto/JSON `chats.historico` em itens somente-leitura,
// exibidos antes das mensagens novas (tabela `mensagens`).
function parseHistorico(historico: string | null): HistItem[] {
  if (!historico) return [];
  const t = historico.trim();
  if (!(t.startsWith("[") || t.startsWith("{"))) {
    return [{ id: "hist-0", direcao: "entrada", conteudo: historico, at: null, historico: true }];
  }
  try {
    const arr = JSON.parse(t);
    if (!Array.isArray(arr)) return [];
    return arr.map((m: Record<string, unknown>, i: number) => {
      const autor = String(m.autor ?? m.de ?? m.role ?? "contato");
      const ehEmpresa = /alice|assistente|ia|bot|empresa|atendente/i.test(autor);
      return {
        id: `hist-${i}`,
        direcao: ehEmpresa ? "saida" : "entrada",
        conteudo: String(m.texto ?? m.mensagem ?? m.content ?? ""),
        at: (m.at as string) ?? (m.data as string) ?? null,
        historico: true as const,
      };
    });
  } catch {
    return [];
  }
}

function Thread({
  chat,
  empresaId,
  onVoltar,
}: {
  chat: Chat;
  empresaId: string;
  onVoltar: () => void;
}) {
  const historico = useMemo(() => parseHistorico(chat.historico), [chat.historico]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoMidia, setEnviandoMidia] = useState(false);
  const [enviando, startEnviar] = useTransition();
  const fimRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Adiciona/atualiza uma mensagem sem duplicar (por id).
  function upsert(m: Mensagem) {
    setMensagens((l) => (l.some((x) => x.id === m.id) ? l : [...l, m]));
  }

  // Carga inicial + assinatura em tempo real das novas mensagens do chat.
  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    carregarMensagens(chat.id).then((ms) => {
      if (vivo) {
        setMensagens(ms);
        setCarregando(false);
      }
    });

    const supabase = createClient();
    const canal = supabase
      .channel(`mensagens:${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => upsert(payload.new as Mensagem)
      )
      .subscribe();

    return () => {
      vivo = false;
      supabase.removeChannel(canal);
    };
  }, [chat.id]);

  // Rola para o fim quando chegam mensagens.
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length, carregando]);

  function enviarTexto() {
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;
    setErro(null);
    startEnviar(async () => {
      const res = await enviarMensagem(chat.id, conteudo);
      if (res.error) {
        setErro(res.error);
        if (res.mensagem) upsert(res.mensagem);
        return;
      }
      setTexto("");
      if (res.mensagem) upsert(res.mensagem);
    });
  }

  async function aoSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;

    if (file.size > CHAT_MEDIA_MAX_BYTES) {
      setErro(
        `"${file.name}" passa do limite de ${(CHAT_MEDIA_MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`
      );
      return;
    }

    setErro(null);
    setEnviandoMidia(true);
    try {
      const supabase = createClient();
      const path = montarChatStoragePath(empresaId, file.name);
      const { error: upErr } = await supabase.storage
        .from(CHAT_BUCKET)
        .upload(path, file, { contentType: file.type || undefined, upsert: false });

      if (upErr) {
        setErro(`Falha ao enviar "${file.name}". Tente novamente.`);
        return;
      }

      const res = await enviarMidiaChat({
        chatId: chat.id,
        storage_path: path,
        mime_type: file.type || tipoMidiaChat(file.type),
        nome: file.name,
        legenda: texto.trim() || undefined,
      });

      if (res.error) {
        setErro(res.error);
        if (res.mensagem) upsert(res.mensagem);
        return;
      }
      setTexto("");
      if (res.mensagem) upsert(res.mensagem);
    } finally {
      setEnviandoMidia(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Cabeçalho */}
      <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <button
          onClick={onVoltar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
          {(chat.nome || chat.telefone || "?").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {chat.nome || "Sem nome"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {chat.telefone || "—"} · {CANAL_LABEL[chat.canal ?? ""] ?? "WhatsApp"}
          </p>
        </div>
      </header>

      {/* Mensagens */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50/60 p-4">
        {historico.map((h) => (
          <Bolha
            key={h.id}
            saida={h.direcao === "saida"}
            texto={h.conteudo}
            hora={formatarHora(h.at)}
            antiga
          />
        ))}

        {historico.length > 0 && mensagens.length > 0 && (
          <div className="py-1 text-center text-[10px] uppercase tracking-wider text-slate-400">
            Novas mensagens
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-6 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : mensagens.length === 0 && historico.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <MessageCircle className="mb-2 h-8 w-8" />
            <p className="text-sm">Nenhuma mensagem ainda. Envie a primeira abaixo.</p>
          </div>
        ) : (
          mensagens.map((m) => <MensagemBolha key={m.id} m={m} />)
        )}
        <div ref={fimRef} />
      </div>

      {/* Erro */}
      {erro && (
        <p className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {erro}
        </p>
      )}

      {/* Barra de envio */}
      <div className="flex items-end gap-2 border-t border-slate-200 p-3">
        <input
          ref={fileRef}
          type="file"
          accept={CHAT_MEDIA_ACCEPT}
          onChange={aoSelecionarArquivo}
          className="hidden"
          id="chat-arquivo"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={enviandoMidia || enviando}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          aria-label="Anexar arquivo"
          title="Enviar imagem, vídeo ou documento"
        >
          {enviandoMidia ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviarTexto();
            }
          }}
          rows={1}
          placeholder="Digite uma mensagem..."
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-brand-500/60"
        />

        <button
          type="button"
          onClick={enviarTexto}
          disabled={!texto.trim() || enviando}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-700/20 transition hover:opacity-90 disabled:opacity-40"
          aria-label="Enviar"
        >
          {enviando ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
//  Bolhas
// ------------------------------------------------------------------

function MensagemBolha({ m }: { m: Mensagem }) {
  const saida = m.direcao === "saida";
  return (
    <div className={`flex ${saida ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
          saida
            ? "bg-brand-gradient text-white"
            : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        {m.tipo !== "texto" && m.media_url && (
          <MidiaConteudo m={m} saida={saida} />
        )}
        {m.conteudo && <p className="whitespace-pre-wrap break-words">{m.conteudo}</p>}
        <span
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            saida ? "text-white/70" : "text-slate-400"
          }`}
        >
          {formatarHora(m.created_at)}
          {saida && <StatusIcon status={m.status} />}
        </span>
      </div>
    </div>
  );
}

function MidiaConteudo({ m, saida }: { m: Mensagem; saida: boolean }) {
  const url = m.media_url!;
  if (m.tipo === "imagem") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={m.media_nome ?? "imagem"}
          className="mb-1 max-h-64 w-full rounded-lg object-cover"
        />
      </a>
    );
  }
  if (m.tipo === "video") {
    return <video src={url} controls className="mb-1 max-h-64 w-full rounded-lg" />;
  }
  if (m.tipo === "audio") {
    return <audio src={url} controls className="mb-1 w-56" />;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 ${
        saida ? "bg-white/15" : "bg-slate-100"
      }`}
    >
      <FileText className="h-5 w-5 shrink-0" />
      <span className="truncate text-xs font-medium">{m.media_nome ?? "documento"}</span>
      <Download className="h-4 w-4 shrink-0 opacity-70" />
    </a>
  );
}

function Bolha({
  saida,
  texto,
  hora,
  antiga,
}: {
  saida: boolean;
  texto: string;
  hora: string;
  antiga?: boolean;
}) {
  return (
    <div className={`flex ${saida ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
          saida
            ? `bg-brand-gradient text-white ${antiga ? "opacity-80" : ""}`
            : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{texto}</p>
        {hora && (
          <span
            className={`mt-1 block text-right text-[10px] ${
              saida ? "text-white/70" : "text-slate-400"
            }`}
          >
            {hora}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string | null }) {
  if (status === "erro") return <AlertCircle className="h-3 w-3 text-red-200" />;
  if (status === "lida") return <CheckCheck className="h-3 w-3" />;
  if (status === "entregue") return <CheckCheck className="h-3 w-3 opacity-70" />;
  return <Check className="h-3 w-3" />;
}
