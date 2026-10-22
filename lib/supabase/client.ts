import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";

/** Cliente do navegador — usado no login e nos uploads do painel (RLS aplica). */
export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
