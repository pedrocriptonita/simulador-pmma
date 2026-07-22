import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="text-center">
        <span className="text-xl font-bold tracking-tight">Simulador PM MA 2026</span>
        <p className="text-muted-foreground text-xs">Prova em 11/10/2026 · Banca Cebraspe</p>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
