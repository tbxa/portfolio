import { publicEnv } from "@/lib/env";

export type Bucket = "media" | "resume";

/** URL pública de um arquivo do Storage. Nomes são únicos por upload, então não há cache velho. */
export function storageUrl(path: string | null | undefined, bucket: Bucket = "media") {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${bucket}/${encoded}`;
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export function imageExtension(mime: string) {
  return IMAGE_EXTENSIONS[mime] ?? null;
}

/** Caminho único dentro de uma pasta: evita colisões e cache desatualizado na CDN. */
export function uniquePath(folder: string, extension: string) {
  return `${folder}/${crypto.randomUUID()}.${extension}`;
}
