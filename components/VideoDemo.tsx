import { PlayCircle } from "lucide-react";

// Quando o vídeo estiver pronto, basta definir VIDEO_EMBED_URL com a URL
// de embed (YouTube/Vimeo). Enquanto for null, mostramos o placeholder.
const VIDEO_EMBED_URL: string | null = null;

export default function VideoDemo() {
  return (
    <section id="video" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Veja na prática</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            A <span className="gradient-text">Alice</span> em ação
          </h2>
          <p className="mt-4 text-slate-600">
            Assista a uma demonstração de como a Alice atende, tira dúvidas e
            agenda seus clientes automaticamente.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xl">
            {VIDEO_EMBED_URL ? (
              <iframe
                src={VIDEO_EMBED_URL}
                title="Demonstração da Siarom AI"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
                <PlayCircle className="h-16 w-16 text-slate-500" />
                <p className="font-display text-lg font-semibold">Vídeo em breve</p>
                <p className="text-sm text-slate-400">
                  Estamos preparando a demonstração. Volte logo!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
