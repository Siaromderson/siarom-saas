"use client";

import { useEffect, useState, useTransition } from "react";
import { Star, X, Loader2, Check } from "lucide-react";
import { enviarFeedback } from "@/app/crm/feedback-actions";

const KEY = "siarom_feedback_trial";

// Coleta de feedback exibida no 2º dia do teste grátis (uma vez por conta).
export function FeedbackPrompt() {
  const [aberto, setAberto] = useState(false);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [pending, start] = useTransition();
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(KEY)) {
      setAberto(true);
    }
  }, []);

  function fechar() {
    localStorage.setItem(KEY, "1");
    setAberto(false);
  }

  function enviar() {
    if (!nota) return;
    start(async () => {
      await enviarFeedback(nota, comentario);
      localStorage.setItem(KEY, "1");
      setEnviado(true);
      setTimeout(() => setAberto(false), 1500);
    });
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Como está sendo sua experiência?
          </h2>
          <button onClick={fechar} className="text-slate-500 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {enviado ? (
          <p className="mt-6 flex items-center gap-2 text-accent-600">
            <Check className="h-5 w-5" /> Obrigado pelo seu feedback!
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Você está no 2º dia do teste. Conte pra gente como tem sido usar a Alice.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNota(n)}
                  className="transition hover:scale-110"
                  aria-label={`${n} estrelas`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      n <= nota ? "fill-brand-400 text-brand-400" : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="O que podemos melhorar? (opcional)"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500/60"
            />

            <button
              onClick={enviar}
              disabled={!nota || pending}
              className="btn-primary mt-4 w-full"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
