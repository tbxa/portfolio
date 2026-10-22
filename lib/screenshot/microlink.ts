import "server-only";

export type Device = "desktop" | "mobile";

const VIEWPORTS: Record<Device, Record<string, string>> = {
  desktop: { "viewport.width": "1440", "viewport.height": "900", "viewport.deviceScaleFactor": "1" },
  mobile: {
    "viewport.width": "390",
    "viewport.height": "844",
    "viewport.deviceScaleFactor": "2",
    "viewport.isMobile": "true",
    "viewport.hasTouch": "true",
  },
};

const MAX_BYTES = 12 * 1024 * 1024;

export class ScreenshotError extends Error {}

/**
 * Captura via Microlink (https://microlink.io). Sem chave: plano gratuito
 * com limite diário. Com MICROLINK_API_KEY: endpoint pro.
 * Só conversamos com o host fixo da API, sem seguir redirecionamentos.
 */
export async function captureWithMicrolink(url: string, device: Device): Promise<Buffer> {
  const apiKey = process.env.MICROLINK_API_KEY;
  const endpoint = new URL(apiKey ? "https://pro.microlink.io/" : "https://api.microlink.io/");
  const params = {
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    waitUntil: "networkidle2",
    ...VIEWPORTS[device],
  };
  for (const [key, value] of Object.entries(params)) endpoint.searchParams.set(key, value);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(50_000),
    });
  } catch {
    throw new ScreenshotError("O serviço de captura não respondeu a tempo. Tente novamente.");
  }

  if (response.status === 429) {
    throw new ScreenshotError("Limite diário de capturas atingido. Envie uma imagem manualmente.");
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new ScreenshotError("Não foi possível capturar o site. Verifique se a URL está acessível.");
  }

  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new ScreenshotError("A imagem gerada é grande demais.");

  const reader = response.body?.getReader();
  if (!reader) throw new ScreenshotError("Resposta vazia do serviço de captura.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new ScreenshotError("A imagem gerada é grande demais.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
