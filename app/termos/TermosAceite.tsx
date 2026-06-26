"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

export function TermosAceite({ onAccept }: { onAccept: () => Promise<void> }) {
  const [aceito, setAceito] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6">
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={aceito}
          onChange={(e) => setAceito(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-brand-500 focus:ring-brand-500"
        />
        Li e aceito os termos de uso e a política de privacidade da Siarom AI.
      </label>

      <button
        disabled={!aceito || pending}
        onClick={() => startTransition(() => onAccept())}
        className="btn-primary mt-5 w-full"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aceitar e continuar"}
      </button>
    </div>
  );
}
