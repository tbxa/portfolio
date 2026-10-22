import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AdminSession =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "forbidden"; user: User }
  | { status: "admin"; user: User; supabase: SupabaseClient };

/** Lê a sessão e confirma no banco (função is_admin) se o usuário é administrador. */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  // O painel é sempre renderizado por requisição (nunca pré-gerado no build).
  await connection();
  if (!isSupabaseConfigured) return { status: "unconfigured" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return { status: "forbidden", user };

  return { status: "admin", user, supabase };
});

/** Para páginas do painel: redireciona quem não é administrador. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (session.status !== "admin") redirect("/admin/login");
  return session;
}

export class NotAuthorizedError extends Error {
  constructor() {
    super("Acesso não autorizado.");
  }
}

/** Para Server Actions: lança erro se não houver administrador autenticado. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (session.status !== "admin") throw new NotAuthorizedError();
  return session;
}
