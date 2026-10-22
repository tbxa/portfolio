import { NextResponse } from "next/server";

import { getProfile } from "@/lib/data/public";
import { storageUrl } from "@/lib/storage";

/**
 * Link permanente para o currículo (ex.: para colocar no LinkedIn).
 * Redireciona para o PDF mais recente enviado pelo painel.
 */
export async function GET(request: Request) {
  const profile = await getProfile();
  const url = storageUrl(profile.resume_path, "resume");
  if (!url) return NextResponse.redirect(new URL("/#contato", request.url), 307);
  return NextResponse.redirect(url, 307);
}
