"use client";

import { Button } from "@/components/ui/button";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <h1 className="text-lg font-semibold">Não foi possível carregar esta página</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verifique a conexão com o Supabase e se as migrations foram aplicadas.
        {error.digest && <span className="block font-mono text-xs">Código: {error.digest}</span>}
      </p>
      <Button variant="outline" className="mt-4" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
