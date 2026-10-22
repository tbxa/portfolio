import type { Metadata } from "next";

import { AccessNotice } from "@/components/admin/access-notice";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!isSupabaseConfigured) return <AccessNotice kind="unconfigured" />;
  const { next } = await searchParams;
  // Só aceita destinos internos do painel (evita open redirect).
  const destination = next && /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : "/admin";

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center px-4">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,#000_30%,transparent_100%)]" />
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-xl shadow-black/5">
        <div className="space-y-1">
          <p className="font-mono text-sm">
            <span className="text-brand">~/</span>admin
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Entrar no painel</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito ao administrador do portfólio.</p>
        </div>
        <LoginForm destination={destination} />
      </div>
    </main>
  );
}
