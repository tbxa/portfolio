"use server";

import sharp from "sharp";
import type { z } from "zod";

import { adminAction, dbError, parseOrThrow } from "@/lib/actions/shared";
import { captureWithMicrolink, ScreenshotError } from "@/lib/screenshot/microlink";
import { assertPublicHttpUrl, UnsafeUrlError } from "@/lib/security/url-guard";
import { uniquePath } from "@/lib/storage";
import { screenshotSchema } from "@/lib/validations";

/**
 * Gera um screenshot do site, converte para WebP e salva no Storage.
 * Retorna o caminho para o formulário pré-visualizar; nada é gravado no
 * projeto até o administrador salvar.
 */
export async function captureScreenshot(input: z.input<typeof screenshotSchema>) {
  return adminAction(
    async (supabase) => {
      const { url, device } = parseOrThrow(screenshotSchema, input);

      try {
        await assertPublicHttpUrl(url);
      } catch (error) {
        if (error instanceof UnsafeUrlError) throw new Error(error.message);
        throw error;
      }

      let image: Buffer;
      try {
        const raw = await captureWithMicrolink(url, device);
        image = await sharp(raw)
          .resize({ width: device === "mobile" ? 780 : 1600, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } catch (error) {
        if (error instanceof ScreenshotError) throw new Error(error.message);
        console.error("[screenshot]", error);
        throw new Error("Não foi possível processar a captura.");
      }

      const path = uniquePath("projects", "webp");
      const { error } = await supabase.storage
        .from("media")
        .upload(path, image, { contentType: "image/webp", cacheControl: "31536000" });
      if (error) throw dbError(error);

      return { path };
    },
    { revalidate: false }
  );
}
