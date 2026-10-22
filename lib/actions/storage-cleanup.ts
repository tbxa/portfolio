import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Bucket } from "@/lib/storage";

/** Remove arquivos do Storage sem interromper a ação principal se algo falhar. */
export async function removeFiles(
  supabase: SupabaseClient,
  bucket: Bucket,
  paths: Array<string | null | undefined>
) {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(unique);
  if (error) console.warn("[storage] falha ao remover arquivos:", error.message);
}

/** Copia um arquivo para um novo caminho único na mesma pasta. */
export async function copyFile(supabase: SupabaseClient, bucket: Bucket, path: string) {
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const extension = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1) : "bin";
  const target = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).copy(path, target);
  if (error) {
    console.warn("[storage] falha ao copiar arquivo:", error.message);
    return null;
  }
  return target;
}
