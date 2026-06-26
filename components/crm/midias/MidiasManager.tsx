"use client";

import { useRef, useState, useTransition } from "react";
import {
  UploadCloud,
  Trash2,
  Loader2,
  Check,
  Link2,
  FileText,
  PlayCircle,
  ImageIcon,
  AlertCircle,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  MIDIAS_BUCKET,
  MIDIA_ACCEPT,
  MIDIA_MAX_BYTES,
  montarStoragePath,
  tipoDoMime,
  formatarTamanho,
  MOMENTO_LABEL,
  TIPO_LABEL,
  type Midia,
  type MidiaMomento,
} from "@/lib/midias";
import {
  registrarMidia,
  atualizarConfigMidia,
  excluirMidia,
} from "@/app/crm/midias/actions";

interface Servico {
  nome: string;
  valor: string;
}

const TIPO_ICON = {
  imagem: ImageIcon,
  video: PlayCircle,
  documento: FileText,
} as const;

export function MidiasManager({
  empresaId,
  inicial,
  servicos,
}: {
  empresaId: string;
  inicial: Midia[];
  servicos: Servico[];
}) {
  const [midias, setMidias] = useState<Midia[]>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = ""; // permite reenviar o mesmo arquivo
    if (!files.length) return;

    setErro(null);
    setEnviando(true);
    const supabase = createClient();

    for (const file of files) {
      if (file.size > MIDIA_MAX_BYTES) {
        setErro(`"${file.name}" passa do limite de ${formatarTamanho(MIDIA_MAX_BYTES)}.`);
        continue;
      }

      const path = montarStoragePath(empresaId, file.name);
      const { error: upErr } = await supabase.storage
        .from(MIDIAS_BUCKET)
        .upload(path, file, {
          contentType: file.type || undefined,
          upsert: false,
        });

      if (upErr) {
        setErro(`Falha ao enviar "${file.name}". Tente novamente.`);
        continue;
      }

      const res = await registrarMidia({
        nome: file.name,
        storage_path: path,
        mime_type: file.type || tipoDoMime(file.type),
        tamanho: file.size,
      });

      if (res.error || !res.midia) {
        setErro(res.error ?? "Não foi possível registrar a mídia.");
        continue;
      }
      setMidias((l) => [res.midia as Midia, ...l]);
    }

    setEnviando(false);
  }

  function removerLocal(id: string) {
    setMidias((l) => l.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Área de upload */}
      <div className="card p-6">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={MIDIA_ACCEPT}
          onChange={aoSelecionar}
          className="hidden"
          id="midia-upload"
        />
        <label
          htmlFor="midia-upload"
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-200/70 bg-brand-500/5 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-500/10 ${
            enviando ? "pointer-events-none opacity-70" : ""
          }`}
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
            {enviando ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </span>
          <span className="font-display text-base font-bold text-slate-900">
            {enviando ? "Enviando..." : "Clique para enviar uma mídia"}
          </span>
          <span className="max-w-md text-xs text-slate-500">
            Imagens, vídeos e documentos até {formatarTamanho(MIDIA_MAX_BYTES)} cada.
            Você pode selecionar vários arquivos de uma vez.
          </span>
        </label>

        {erro && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </p>
        )}
      </div>

      {/* Lista de mídias */}
      {midias.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhuma mídia cadastrada ainda. Envie a primeira acima.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {midias.map((m) => (
            <MidiaCard
              key={m.id}
              midia={m}
              servicos={servicos}
              onExcluir={() => removerLocal(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MidiaCard({
  midia,
  servicos,
  onExcluir,
}: {
  midia: Midia;
  servicos: Servico[];
  onExcluir: () => void;
}) {
  const [momento, setMomento] = useState<MidiaMomento>(midia.momento);
  const [servico, setServico] = useState<string>(midia.servico_nome ?? "");
  const [salvo, setSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [excluindo, startExcluir] = useTransition();

  const Icon = TIPO_ICON[midia.tipo];

  function salvar(novoMomento: MidiaMomento, novoServico: string) {
    setErro(null);
    setSalvo(false);
    startTransition(async () => {
      const res = await atualizarConfigMidia({
        id: midia.id,
        momento: novoMomento,
        servico_nome: novoMomento === "ao_oferecer" ? novoServico || null : null,
      });
      if (res.error) {
        setErro(res.error);
        return;
      }
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    });
  }

  function aoMudarMomento(v: MidiaMomento) {
    setMomento(v);
    salvar(v, servico);
  }

  function aoMudarServico(v: string) {
    setServico(v);
    salvar(momento, v);
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(midia.url_publica);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.open(midia.url_publica, "_blank");
    }
  }

  function excluir() {
    if (!window.confirm(`Excluir "${midia.nome}"? Esta ação não pode ser desfeita.`))
      return;
    startExcluir(async () => {
      const res = await excluirMidia(midia.id);
      if (res.error) {
        setErro(res.error);
        return;
      }
      onExcluir();
    });
  }

  return (
    <div className="card flex flex-col overflow-hidden p-0">
      {/* Preview */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {midia.tipo === "imagem" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={midia.url_publica}
            alt={midia.nome}
            className="h-full w-full object-cover"
          />
        ) : midia.tipo === "video" ? (
          <video
            src={midia.url_publica}
            controls
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <FileText className="h-10 w-10" />
            <span className="text-xs font-medium uppercase">
              {midia.mime_type?.split("/")[1] ?? "arquivo"}
            </span>
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink-900/70 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
          <Icon className="h-3.5 w-3.5" />
          {TIPO_LABEL[midia.tipo]}
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900" title={midia.nome}>
              {midia.nome}
            </p>
            <p className="text-xs text-slate-400">{formatarTamanho(midia.tamanho)}</p>
          </div>
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            aria-label="Excluir mídia"
            className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {excluindo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Momento de envio */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Quando enviar
          </label>
          <select
            value={momento}
            onChange={(e) => aoMudarMomento(e.target.value as MidiaMomento)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="inicio_conversa">{MOMENTO_LABEL.inicio_conversa}</option>
            <option value="ao_oferecer">{MOMENTO_LABEL.ao_oferecer}</option>
          </select>
        </div>

        {/* Vínculo com produto/serviço */}
        {momento === "ao_oferecer" &&
          (servicos.length > 0 ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Produto / serviço
              </label>
              <select
                value={servico}
                onChange={(e) => aoMudarServico(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="">Qualquer produto/serviço</option>
                {servicos.map((s) => (
                  <option key={s.nome} value={s.nome}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Cadastre produtos/serviços em Configurações → Dados da empresa para
              vincular esta mídia a um deles.
            </p>
          ))}

        {/* Rodapé: link + status */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={copiarLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
          >
            {copiado ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copiado ? "Link copiado" : "Copiar link público"}
          </button>

          <span className="text-xs text-slate-400">
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : salvo ? (
              <span className="inline-flex items-center gap-1 text-accent-600">
                <Check className="h-3.5 w-3.5" /> Salvo
              </span>
            ) : null}
          </span>
        </div>

        {erro && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}
