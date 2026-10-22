"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_IMAGE_TYPES,
  imageExtension,
  MAX_IMAGE_BYTES,
  MAX_RESUME_BYTES,
  uniquePath,
} from "@/lib/storage";

/**
 * Uploads vão direto do navegador para o Storage (sem passar pelo servidor
 * do Next). O RLS do bucket garante que só administradores conseguem gravar.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Use PNG, JPG, WebP, AVIF ou GIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("A imagem deve ter no máximo 8 MB.");
  }
  const path = uniquePath(folder, imageExtension(file.type)!);
  const { error } = await createClient()
    .storage.from("media")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return path;
}

export async function uploadResume(file: File): Promise<string> {
  if (file.type !== "application/pdf") throw new Error("Envie um arquivo PDF.");
  if (file.size > MAX_RESUME_BYTES) throw new Error("O PDF deve ter no máximo 10 MB.");
  const path = uniquePath("resume", "pdf");
  const { error } = await createClient()
    .storage.from("resume")
    .upload(path, file, { contentType: "application/pdf", cacheControl: "3600" });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return path;
}

/** Remove um upload que acabou não sendo salvo (melhor esforço). */
export async function discardUpload(path: string) {
  await createClient().storage.from("media").remove([path]);
}
