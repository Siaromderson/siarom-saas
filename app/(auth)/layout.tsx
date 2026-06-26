import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5 font-display text-xl font-bold text-slate-900"
        >
          <Image
            src="/imagens/logo.png"
            alt="Siarom AI"
            width={72}
            height={40}
            priority
            className="h-10 w-auto"
          />
          Siarom <span className="gradient-text">AI</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
