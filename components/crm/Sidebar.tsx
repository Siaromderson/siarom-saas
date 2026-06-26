"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  CalendarDays,
  Megaphone,
  Settings,
  Send,
  LogOut,
  Menu,
  X,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  SECTION_ORDER,
  SECTIONS,
  temAcesso,
  type SectionId,
} from "@/lib/features";

const ICONS: Record<SectionId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  kanban: KanbanSquare,
  contatos: Users,
  followup: Send,
  agenda: CalendarDays,
  marketing: Megaphone,
  configuracoes: Settings,
};

export function Sidebar({
  empresaNome,
  plano,
  recursos,
  isAdmin,
  signOut,
}: {
  empresaNome: string;
  plano: string;
  recursos: string[];
  isAdmin: boolean;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const empresaSim = { plano, recursos_liberados: recursos };

  return (
    <>
      {/* Topbar mobile */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/50 bg-white/60 px-4 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <Link href="/crm" className="flex items-center gap-2 font-display font-bold text-slate-900">
          <Image src="/imagens/logo.png" alt="Siarom AI" width={48} height={27} className="h-7 w-auto" />
          Siarom <span className="gradient-text">AI</span>
        </Link>
        <button onClick={() => setOpen((v) => !v)} className="text-slate-700" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/50 bg-white/65 backdrop-blur-xl backdrop-saturate-150 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Marca */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/50 px-5 font-display text-lg font-bold text-slate-900">
          <Image src="/imagens/logo.png" alt="Siarom AI" width={56} height={31} priority className="h-8 w-auto" />
          Siarom <span className="gradient-text">AI</span>
        </div>

        {/* Empresa / plano */}
        <div className="border-b border-white/50 px-5 py-4">
          <p className="truncate text-sm font-semibold text-slate-900">{empresaNome}</p>
          <span className="mt-1 inline-flex items-center rounded-full border border-brand-200/60 bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-600">
            Plano {plano}
          </span>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {SECTION_ORDER.map((id) => {
            const sec = SECTIONS[id];
            const Icon = ICONS[id];
            const href = sec.href;
            const active =
              href === "/crm" ? pathname === "/crm" : pathname.startsWith(href);
            const liberado = temAcesso(empresaSim, id);
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-gradient text-white shadow-lg shadow-brand-700/20"
                    : liberado
                      ? "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                      : "text-slate-400 hover:bg-white/50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{sec.label}</span>
                {!liberado && <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" />}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={`mt-2 flex items-center gap-3 rounded-xl border border-brand-200/60 px-3 py-2.5 text-sm font-semibold transition ${
                pathname.startsWith("/admin")
                  ? "bg-brand-gradient text-white"
                  : "bg-brand-500/10 text-brand-600 hover:bg-brand-500/20"
              }`}
            >
              <ShieldCheck className="h-5 w-5 shrink-0" />
              Admin
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/50 p-3">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Espaçador para a topbar mobile */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
