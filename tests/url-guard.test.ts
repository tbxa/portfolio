import { describe, expect, it } from "vitest";

import { isPublicIp } from "@/lib/security/ip";
import { assertPublicHttpUrl, UnsafeUrlError } from "@/lib/security/url-guard";

const resolveTo = (...ips: string[]) => async () => ips;

describe("isPublicIp", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.0.10",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::",
    "fe80::1",
    "fd00::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "::ffff:169.254.169.254",
    "64:ff9b::a9fe:a9fe",
    "2002:7f00:1::",
    "not-an-ip",
  ])("bloqueia %s", (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it.each(["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"])(
    "permite %s",
    (ip) => {
      expect(isPublicIp(ip)).toBe(true);
    }
  );
});

describe("assertPublicHttpUrl", () => {
  it("aceita um site público", async () => {
    const url = await assertPublicHttpUrl("https://example.com/page", resolveTo("93.184.215.14"));
    expect(url.hostname).toBe("example.com");
  });

  it.each([
    ["file:///etc/passwd", "esquema"],
    ["ftp://example.com", "esquema"],
    ["javascript:alert(1)", "esquema"],
    ["https://user:pass@example.com", "credenciais"],
    ["https://example.com:8080", "porta"],
    ["http://localhost", "localhost"],
    ["http://app.localhost", "sufixo"],
    ["http://printer.local", "sufixo"],
    ["http://127.0.0.1", "IP literal"],
    ["http://[::1]", "IPv6 literal"],
    ["http://[::ffff:127.0.0.1]", "IPv4 mapeado"],
    ["http://169.254.169.254/latest/meta-data", "metadados"],
    ["http://intranet", "sem domínio"],
  ])("rejeita %s (%s)", async (raw) => {
    await expect(assertPublicHttpUrl(raw, resolveTo("93.184.215.14"))).rejects.toBeInstanceOf(
      UnsafeUrlError
    );
  });

  it("rejeita domínio que resolve para IP privado (DNS rebinding)", async () => {
    await expect(
      assertPublicHttpUrl("https://evil.example", resolveTo("93.184.215.14", "10.0.0.5"))
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("rejeita domínio que não resolve", async () => {
    await expect(
      assertPublicHttpUrl("https://nope.example", async () => {
        throw new Error("ENOTFOUND");
      })
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });
});
