"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Field } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ destination }: { destination: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    });

    if (signInError) {
      setLoading(false);
      // Mensagem genérica: não revela se o e-mail existe.
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.replace(destination);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field id="email" label="E-mail">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field id="password" label="Senha">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="h-9 w-full" disabled={loading}>
        {loading && <Loader2Icon className="animate-spin" />}
        Entrar
      </Button>
    </form>
  );
}
