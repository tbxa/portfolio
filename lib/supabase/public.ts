import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";

/** Tag única do conteúdo público: o painel a invalida após cada alteração. */
export const CONTENT_TAG = "portfolio-content";

/**
 * Cliente anônimo sem cookies para as páginas públicas. As requisições ficam
 * no Data Cache do Next com a tag CONTENT_TAG, então o site é servido
 * estático e atualizado sob demanda — sem novo deploy.
 */
export function createPublicClient() {
  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { tags: [CONTENT_TAG], revalidate: 60 * 60 * 24 },
        }),
    },
  });
}
