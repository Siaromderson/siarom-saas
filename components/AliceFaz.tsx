import {
  AudioLines,
  Image as ImageIcon,
  FileText,
  Video,
  Hand,
  Bot,
  RefreshCw,
  Send,
  Gem,
} from "lucide-react";

const GROUPS = [
  {
    eyebrow: "Interpretação de mídia",
    title: "Alice entende muito além de texto",
    desc: "Mande do jeito que for mais fácil: ela compreende o conteúdo e responde com naturalidade.",
    items: [
      {
        icon: AudioLines,
        title: "Áudios",
        desc: "Transcreve e interpreta mensagens de voz, sem você precisar digitar.",
      },
      {
        icon: ImageIcon,
        title: "Imagens",
        desc: "Lê e interpreta fotos e prints enviados pelo cliente.",
      },
      {
        icon: FileText,
        title: "Documentos",
        desc: "Analisa PDF, Word e outros arquivos para entender o contexto.",
      },
      {
        icon: Video,
        title: "Vídeos",
        desc: "Interpreta vídeos enviados na conversa e capta o que importa.",
      },
    ],
  },
  {
    eyebrow: "Intervenção humana",
    title: "O humano assume quando precisar — sem atrito",
    desc: "Alice e sua equipe trabalham no mesmo número, em total sintonia.",
    items: [
      {
        icon: Hand,
        title: "Pausa automática",
        desc: "Se um humano enviar mensagem pelo número da IA, a Alice para sozinha na hora.",
      },
      {
        icon: Bot,
        title: "Atendente no controle",
        desc: "O atendente assume o comando sem interromper o fluxo da conversa.",
      },
      {
        icon: RefreshCw,
        title: "Retomada inteligente",
        desc: "Alice volta a atender sozinha assim que o humano sinalizar.",
      },
    ],
  },
];

export default function AliceFaz() {
  return (
    <section id="o-que-alice-faz" className="bg-slate-50 py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Capacidades</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            O que a <span className="gradient-text">Alice faz?</span>
          </h2>
          <p className="mt-4 text-slate-600">
            Muito mais que respostas automáticas: a Alice entende mídias, divide o
            atendimento com a sua equipe e — no plano Diamante — envia conteúdo ativamente.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {GROUPS.map((group) => (
            <div key={group.eyebrow}>
              <div className="mx-auto max-w-2xl text-center">
                <span className="eyebrow">{group.eyebrow}</span>
                <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                  {group.title}
                </h3>
                <p className="mt-3 text-slate-600">{group.desc}</p>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {group.items.map((item) => (
                  <div key={item.title} className="card p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                      <item.icon className="h-6 w-6" />
                    </span>
                    <h4 className="mt-5 font-display text-lg font-semibold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Envio de mídias — exclusivo Diamante */}
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-brand-gradient p-8 text-white shadow-lg shadow-brand-600/20 sm:p-12">
            <div className="relative mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-white/30">
                <Gem className="h-3.5 w-3.5" />
                Exclusivo Diamante
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                Alice também envia mídias ativamente
              </h3>
              <p className="mt-4 max-w-2xl text-white/85">
                No plano Diamante, a Alice não só interpreta — ela{" "}
                <strong className="font-semibold text-white">
                  envia imagens, documentos e vídeos
                </strong>{" "}
                por conta própria, transformando o atendimento em vendas e marketing ativo.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: ImageIcon, label: "Envia imagens" },
                  { icon: FileText, label: "Envia documentos" },
                  { icon: Video, label: "Envia vídeos" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15">
                      <m.icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold">{m.label}</span>
                  </div>
                ))}
              </div>

              <a href="#planos" className="btn-ghost mt-8 bg-white text-brand-700 hover:bg-white/90">
                <Send className="h-4 w-4" />
                Conhecer o plano Diamante
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
