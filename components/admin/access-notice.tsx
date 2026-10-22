"use client";

import { ShieldAlertIcon, WrenchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AccessNotice({ kind, email }: { kind: "forbidden" | "unconfigured"; email?: string }) {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-xl border bg-card p-8 text-center">
        {kind === "forbidden" ? (
          <>
            <ShieldAlertIcon className="mx-auto size-8 text-destructive" aria-hidden="true" />
            <h1 className="text-xl font-semibold">Acesso não autorizado</h1>
            <p className="text-sm text-muted-foreground">
              A conta <strong>{email}</strong> não tem permissão de administrador. Adicione-a na tabela{" "}
              <code className="font-mono">admins</code> do Supabase (veja o README).
            </p>
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </>
        ) : (
          <>
            <WrenchIcon className="mx-auto size-8 text-brand" aria-hidden="true" />
            <h1 className="text-xl font-semibold">Supabase não configurado</h1>
            <p className="text-sm text-muted-foreground">
              Defina <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo{" "}
              <code className="font-mono">.env.local</code> e reinicie o servidor.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
