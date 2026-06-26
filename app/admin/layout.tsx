import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin · Siarom AI" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-900">
            <Image src="/imagens/logo.png" alt="Siarom AI" width={56} height={31} className="h-8 w-auto" />
            Siarom <span className="gradient-text">AI</span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-brand-200/60 bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          </Link>
          <Link href="/crm" className="btn-glass px-4 py-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Meu CRM
          </Link>
        </div>
      </header>

      <main className="container-x py-8">{children}</main>
    </div>
  );
}
