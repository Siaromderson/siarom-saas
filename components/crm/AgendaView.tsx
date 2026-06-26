"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import {
  salvarAgendamento,
  excluirAgendamento,
} from "@/app/crm/agenda/actions";
import type { Agendamento } from "@/lib/crm";

type Visao = "dia" | "semana" | "mes";

const STATUS_CLS: Record<string, string> = {
  agendado: "bg-sky-100 text-sky-700",
  confirmado: "bg-accent-500/15 text-accent-600",
  concluido: "bg-brand-500/15 text-brand-600",
  cancelado: "bg-red-100 text-red-600",
};

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// ---- Helpers de data ----
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const dia = (x.getDay() + 6) % 7; // segunda = 0
  return addDays(x, -dia);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgendaView({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [visao, setVisao] = useState<Visao>("semana");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const [editando, setEditando] = useState<Agendamento | null>(null);
  const [criando, setCriando] = useState(false);
  const [novoInicio, setNovoInicio] = useState<string | undefined>(undefined);

  const hoje = startOfDay(new Date());

  // Intervalo da visão atual [inicio, fim)
  const { inicio, fim, titulo } = useMemo(() => {
    if (visao === "dia") {
      return {
        inicio: startOfDay(cursor),
        fim: addDays(startOfDay(cursor), 1),
        titulo: cursor.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      };
    }
    if (visao === "semana") {
      const ini = startOfWeek(cursor);
      const f = addDays(ini, 7);
      return {
        inicio: ini,
        fim: f,
        titulo: `${ini.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })} – ${addDays(f, -1).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
      };
    }
    const ini = startOfMonth(cursor);
    const f = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    return {
      inicio: ini,
      fim: f,
      titulo: cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    };
  }, [visao, cursor]);

  // Agendamentos que aparecem na visão atual
  const naVisao = useMemo(
    () =>
      agendamentos
        .filter((a) => {
          const t = new Date(a.inicio).getTime();
          return t >= inicio.getTime() && t < fim.getTime();
        })
        .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()),
    [agendamentos, inicio, fim]
  );

  function navegar(dir: -1 | 1) {
    if (visao === "dia") setCursor((c) => addDays(c, dir));
    else if (visao === "semana") setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
  }

  function abrirNovo(data?: Date) {
    if (data) {
      const d = new Date(data);
      d.setHours(9, 0, 0, 0);
      const off = d.getTimezoneOffset();
      setNovoInicio(new Date(d.getTime() - off * 60000).toISOString().slice(0, 16));
    } else {
      setNovoInicio(undefined);
    }
    setCriando(true);
  }

  return (
    <div>
      {/* Barra de controle */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navegar(-1)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/70 hover:text-slate-900"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCursor(startOfDay(new Date()))}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900"
          >
            Hoje
          </button>
          <button
            onClick={() => navegar(1)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/70 hover:text-slate-900"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="ml-1 font-display text-base font-bold capitalize text-slate-900">
            {titulo}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Métrica da visão */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-600">
            <CalendarCheck className="h-4 w-4" />
            {naVisao.length}{" "}
            {naVisao.length === 1 ? "agendamento" : "agendamentos"}
          </span>

          {/* Alternador de visão */}
          <div className="flex rounded-xl border border-white/60 bg-white/50 p-1 backdrop-blur-md">
            {(["dia", "semana", "mes"] as Visao[]).map((v) => (
              <button
                key={v}
                onClick={() => setVisao(v)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                  visao === v
                    ? "bg-brand-gradient text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {v === "mes" ? "Mês" : v}
              </button>
            ))}
          </div>

          <button onClick={() => abrirNovo()} className="btn-primary">
            <Plus className="h-4 w-4" /> Novo
          </button>
        </div>
      </div>

      {/* Corpo da visão */}
      <div className="mt-5">
        {visao === "dia" && (
          <VisaoDia
            itens={naVisao}
            dia={cursor}
            onEditar={setEditando}
            onNovo={() => abrirNovo(cursor)}
          />
        )}
        {visao === "semana" && (
          <VisaoSemana
            itens={naVisao}
            inicioSemana={inicio}
            hoje={hoje}
            onEditar={setEditando}
            onNovoDia={abrirNovo}
          />
        )}
        {visao === "mes" && (
          <VisaoMes
            itens={naVisao}
            mesRef={cursor}
            hoje={hoje}
            onSelecionarDia={(d) => {
              setCursor(d);
              setVisao("dia");
            }}
          />
        )}
      </div>

      {(criando || editando) && (
        <AgendamentoModal
          agendamento={editando}
          defaultInicio={novoInicio}
          onClose={() => {
            setCriando(false);
            setEditando(null);
            setNovoInicio(undefined);
          }}
        />
      )}
    </div>
  );
}

// ---- Visão Dia ----
function VisaoDia({
  itens,
  onEditar,
  onNovo,
}: {
  itens: Agendamento[];
  dia: Date;
  onEditar: (a: Agendamento) => void;
  onNovo: () => void;
}) {
  if (itens.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500">
        Nenhum agendamento neste dia.{" "}
        <button onClick={onNovo} className="font-semibold text-brand-600 hover:underline">
          Criar um
        </button>
        .
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {itens.map((a) => (
        <EventoLinha key={a.id} a={a} onEditar={onEditar} />
      ))}
    </div>
  );
}

// ---- Visão Semana ----
function VisaoSemana({
  itens,
  inicioSemana,
  hoje,
  onEditar,
  onNovoDia,
}: {
  itens: Agendamento[];
  inicioSemana: Date;
  hoje: Date;
  onEditar: (a: Agendamento) => void;
  onNovoDia: (d: Date) => void;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {dias.map((d, i) => {
        const eventos = itens.filter((a) => sameDay(new Date(a.inicio), d));
        const ehHoje = sameDay(d, hoje);
        return (
          <div
            key={i}
            className={`flex min-h-[8rem] flex-col rounded-2xl border p-2 backdrop-blur-md ${
              ehHoje ? "border-brand-300 bg-brand-500/10" : "border-white/50 bg-white/40"
            }`}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                {DIAS_SEMANA[i]}
              </span>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                  ehHoje ? "bg-brand-gradient text-white" : "text-slate-700"
                }`}
              >
                {d.getDate()}
              </span>
            </div>
            <div className="flex-1 space-y-1.5">
              {eventos.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onEditar(a)}
                  className="block w-full rounded-lg border border-white/60 bg-white/70 p-1.5 text-left transition hover:shadow-glass"
                >
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {a.titulo}
                  </p>
                  <p className="text-[11px] text-brand-600">{hora(a.inicio)}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => onNovoDia(d)}
              className="mt-1.5 rounded-lg px-1 py-1 text-[11px] text-slate-400 transition hover:bg-white/60 hover:text-brand-600"
            >
              + adicionar
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---- Visão Mês ----
function VisaoMes({
  itens,
  mesRef,
  hoje,
  onSelecionarDia,
}: {
  itens: Agendamento[];
  mesRef: Date;
  hoje: Date;
  onSelecionarDia: (d: Date) => void;
}) {
  const inicioMes = startOfMonth(mesRef);
  const gridStart = startOfWeek(inicioMes);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="card overflow-hidden p-3">
      <div className="grid grid-cols-7 border-b border-white/50 pb-2 text-center text-xs font-semibold uppercase text-slate-500">
        {DIAS_SEMANA.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 pt-1">
        {cells.map((d, i) => {
          const doMes = d.getMonth() === mesRef.getMonth();
          const ehHoje = sameDay(d, hoje);
          const eventos = itens.filter((a) => sameDay(new Date(a.inicio), d));
          return (
            <button
              key={i}
              onClick={() => onSelecionarDia(d)}
              className={`flex min-h-[5.5rem] flex-col rounded-xl border p-1.5 text-left transition hover:border-brand-300 ${
                doMes ? "border-white/50 bg-white/40" : "border-transparent bg-transparent opacity-40"
              }`}
            >
              <span
                className={`mb-1 grid h-6 w-6 place-items-center self-end rounded-full text-xs font-bold ${
                  ehHoje ? "bg-brand-gradient text-white" : "text-slate-600"
                }`}
              >
                {d.getDate()}
              </span>
              <div className="space-y-0.5">
                {eventos.slice(0, 2).map((a) => (
                  <p
                    key={a.id}
                    className="truncate rounded bg-brand-500/10 px-1 py-0.5 text-[10px] font-medium text-brand-700"
                  >
                    {hora(a.inicio)} {a.titulo}
                  </p>
                ))}
                {eventos.length > 2 && (
                  <p className="px-1 text-[10px] font-semibold text-slate-500">
                    +{eventos.length - 2} mais
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Linha de evento (visão dia) ----
function EventoLinha({
  a,
  onEditar,
}: {
  a: Agendamento;
  onEditar: (a: Agendamento) => void;
}) {
  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{a.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {hora(a.inicio)}
            {a.fim && ` – ${hora(a.fim)}`}
          </span>
          {a.contato_nome && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {a.contato_nome}
            </span>
          )}
          {a.status && (
            <span
              className={`rounded-full px-2 py-0.5 capitalize ${
                STATUS_CLS[a.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {a.status}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onEditar(a)}
          className="rounded-lg p-2 text-slate-500 hover:bg-white/70 hover:text-slate-900"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <ExcluirBtn id={a.id} />
      </div>
    </div>
  );
}

function ExcluirBtn({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Excluir este agendamento?"))
          start(() => excluirAgendamento(id).then(() => {}));
      }}
      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function AgendamentoModal({
  agendamento,
  defaultInicio,
  onClose,
}: {
  agendamento: Agendamento | null;
  defaultInicio?: string;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setErro(null);
    start(async () => {
      const res = await salvarAgendamento({}, formData);
      if (res.error) setErro(res.error);
      else onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {agendamento ? "Editar agendamento" : "Novo agendamento"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={onSubmit} className="mt-5 space-y-4">
          {agendamento && <input type="hidden" name="id" value={agendamento.id} />}
          <Campo label="Título" name="titulo" defaultValue={agendamento?.titulo ?? ""} required />
          <Campo
            label="Contato"
            name="contato_nome"
            defaultValue={agendamento?.contato_nome ?? ""}
          />
          <div className="grid grid-cols-2 gap-4">
            <Campo
              label="Início"
              name="inicio"
              type="datetime-local"
              defaultValue={toLocalInput(agendamento?.inicio) || defaultInicio || ""}
              required
            />
            <Campo
              label="Fim"
              name="fim"
              type="datetime-local"
              defaultValue={toLocalInput(agendamento?.fim)}
            />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Status</span>
            <select
              name="status"
              defaultValue={agendamento?.status ?? "agendado"}
              className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60"
            >
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Observações</span>
            <textarea
              name="descricao"
              rows={2}
              defaultValue={agendamento?.descricao ?? ""}
              className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60"
            />
          </label>

          {erro && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {erro}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md focus:border-brand-500/60 [color-scheme:light]"
      />
    </label>
  );
}
