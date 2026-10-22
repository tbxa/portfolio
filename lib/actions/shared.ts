import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, updateTag } from "next/cache";
import type { z } from "zod";

import { NotAuthorizedError, requireAdmin } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/supabase/public";
import { fieldErrorsOf } from "@/lib/validations";
import type { ActionResult } from "@/types";

/** Invalida o cache do site público: a próxima visita já vê o conteúdo novo. */
export function revalidateContent() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const POSTGRES_MESSAGES: Record<string, string> = {
  "23505": "Já existe um registro com esse identificador (slug).",
  "23503": "Este item está vinculado a outro registro.",
  "42501": "Acesso não autorizado.",
};

export function dbError(error: { code?: string; message: string }) {
  console.error("[db]", error);
  return new Error(POSTGRES_MESSAGES[error.code ?? ""] ?? "Não foi possível salvar. Tente novamente.");
}

class ValidationError extends Error {
  constructor(public fieldErrors: Record<string, string[]>) {
    super("Revise os campos destacados.");
  }
}

export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError(fieldErrorsOf(result.error));
  return result.data;
}

/**
 * Envelopa uma Server Action: exige administrador, converte exceções em
 * ActionResult e invalida o cache público quando a escrita dá certo.
 */
export async function adminAction<T>(
  run: (supabase: SupabaseClient) => Promise<T>,
  { revalidate = true }: { revalidate?: boolean } = {}
): Promise<ActionResult<T>> {
  try {
    const { supabase } = await requireAdmin();
    const data = await run(supabase);
    if (revalidate) revalidateContent();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message, fieldErrors: error.fieldErrors };
    }
    if (error instanceof NotAuthorizedError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof Error && !("digest" in error)) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}
