"use client";

import { Button } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado ao carregar esta página</h1>
      <p className="max-w-md text-muted-foreground">Tente novamente em alguns instantes.</p>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
