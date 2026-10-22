import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { isPublicIp } from "@/lib/security/ip";

export class UnsafeUrlError extends Error {}

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".lan", ".home", ".corp", ".intranet"];

type Resolver = (hostname: string) => Promise<string[]>;

const defaultResolver: Resolver = async (hostname) =>
  (await lookup(hostname, { all: true, verbatim: true })).map((r) => r.address);

/**
 * Garante que a URL aponta para um site público antes de repassá-la ao
 * serviço de captura (proteção contra SSRF). Rejeita esquemas diferentes de
 * http(s), credenciais na URL, portas não padrão, nomes internos e qualquer
 * hostname que resolva para IP privado/reservado.
 */
export async function assertPublicHttpUrl(raw: string, resolve: Resolver = defaultResolver) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("URL inválida.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Apenas URLs http ou https são permitidas.");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("A URL não pode conter usuário ou senha.");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new UnsafeUrlError("Apenas as portas padrão (80/443) são permitidas.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (
    !hostname ||
    hostname === "localhost" ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new UnsafeUrlError("Endereços internos não são permitidos.");
  }

  if (isIP(hostname)) {
    if (!isPublicIp(hostname)) throw new UnsafeUrlError("Endereços internos não são permitidos.");
    return url;
  }

  if (!hostname.includes(".")) {
    throw new UnsafeUrlError("Informe um domínio público completo.");
  }

  let addresses: string[];
  try {
    addresses = await resolve(hostname);
  } catch {
    throw new UnsafeUrlError("Não foi possível resolver o domínio informado.");
  }
  if (addresses.length === 0 || addresses.some((address) => !isPublicIp(address))) {
    throw new UnsafeUrlError("O domínio aponta para um endereço interno.");
  }

  return url;
}
