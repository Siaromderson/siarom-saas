"use client";

import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

export interface Servico {
  nome: string;
  valor: string;
}

/**
 * Editor da lista de produtos/serviços (nome + valor). Mantém o estado e
 * espelha tudo num input hidden "servicos" (JSON) para o submit do form pai.
 */
export function ServicosEditor({ inicial }: { inicial: Servico[] }) {
  const [itens, setItens] = useState<Servico[]>(
    inicial.length ? inicial : []
  );

  function adicionar() {
    setItens((l) => [...l, { nome: "", valor: "" }]);
  }
  function remover(i: number) {
    setItens((l) => l.filter((_, idx) => idx !== i));
  }
  function alterar(i: number, campo: keyof Servico, valor: string) {
    setItens((l) => l.map((s, idx) => (idx === i ? { ...s, [campo]: valor } : s)));
  }

  return (
    <div>
      <input type="hidden" name="servicos" value={JSON.stringify(itens)} />

      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        Produtos / serviços
      </label>

      {itens.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-400">
          Nenhum serviço cadastrado ainda. Adicione os serviços que a Alice pode
          oferecer com seus valores.
        </p>
      ) : (
        <div className="space-y-2.5">
          {itens.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={s.nome}
                  onChange={(e) => alterar(i, "nome", e.target.value)}
                  placeholder="Nome do serviço"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <input
                type="text"
                value={s.valor}
                onChange={(e) => alterar(i, "valor", e.target.value)}
                placeholder="Valor (ex.: R$ 50)"
                className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="button"
                onClick={() => remover(i)}
                aria-label="Remover serviço"
                className="shrink-0 rounded-xl border border-slate-200 p-2.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={adicionar}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-brand-200/70 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-500/20"
      >
        <Plus className="h-4 w-4" /> Adicionar serviço
      </button>
    </div>
  );
}
