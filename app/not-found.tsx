import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <p className="font-mono text-sm text-brand">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">O endereço pode ter mudado ou o conteúdo não está mais publicado.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Voltar ao início
      </Link>
    </main>
  );
}
