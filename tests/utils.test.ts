import { describe, expect, it } from "vitest";

import { toLines, whatsappLink } from "@/lib/format";
import { slugify, uniqueSlug } from "@/lib/slug";
import { normalizeUrl, projectSchema, technologySchema } from "@/lib/validations";

describe("slugify", () => {
  it("remove acentos e símbolos", () => {
    expect(slugify("Gestão de Clínicas — v2!")).toBe("gestao-de-clinicas-v2");
    expect(slugify("  Next.js & Supabase  ")).toBe("next-js-e-supabase");
    expect(slugify("---")).toBe("");
  });

  it("gera slug único", () => {
    expect(uniqueSlug("app", [])).toBe("app");
    expect(uniqueSlug("app", ["app", "app-2"])).toBe("app-3");
  });
});

describe("toLines", () => {
  it("divide linhas e remove marcadores", () => {
    expect(toLines("- Login\n\n• Dashboard\n1. Relatórios\n  Busca  ")).toEqual([
      "Login",
      "Dashboard",
      "Relatórios",
      "Busca",
    ]);
  });
});

describe("whatsappLink", () => {
  it("mantém só os dígitos", () => {
    expect(whatsappLink("+55 (11) 99999-0000")).toBe("https://wa.me/5511999990000");
    expect(whatsappLink("")).toBeNull();
  });
});

describe("projectSchema", () => {
  const base = {
    name: "Meu site",
    site_url: "meusite.com.br",
    repo_url: "",
    category_id: null,
    year: 2026,
    cover_path: null,
    status: "published" as const,
    featured: false,
    sort_order: 0,
    technology_ids: [],
    images: [],
  };

  it("completa https:// e aceita campos opcionais vazios", () => {
    const parsed = projectSchema.parse(base);
    expect(parsed.site_url).toBe("https://meusite.com.br");
    expect(parsed.description).toBe("");
  });

  it("exige nome", () => {
    expect(projectSchema.safeParse({ ...base, name: "  " }).success).toBe(false);
  });

  it("rejeita URL inválida e caminho com ..", () => {
    expect(projectSchema.safeParse({ ...base, site_url: "javascript:alert(1)" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, cover_path: "../secret" }).success).toBe(false);
  });

  it("normalizeUrl preserva protocolo existente", () => {
    expect(normalizeUrl("http://a.com")).toBe("http://a.com");
    expect(normalizeUrl("  ")).toBe("");
  });
});

describe("technologySchema", () => {
  it("aceita slug do Simple Icons ou URL https", () => {
    const base = { name: "React", category_id: null, visible: true };
    expect(technologySchema.safeParse({ ...base, icon: "react" }).success).toBe(true);
    expect(technologySchema.safeParse({ ...base, icon: "https://x.dev/i.svg" }).success).toBe(true);
    expect(technologySchema.safeParse({ ...base, icon: "http://x.dev/i.svg" }).success).toBe(false);
  });
});

describe("suggestIconSlug", () => {
  it("segue a convenção do Simple Icons", async () => {
    const { suggestIconSlug } = await import("@/lib/slug");
    expect(suggestIconSlug("Next.js")).toBe("nextdotjs");
    expect(suggestIconSlug("Node.js")).toBe("nodedotjs");
    expect(suggestIconSlug("Tailwind CSS")).toBe("tailwindcss");
    expect(suggestIconSlug("C#")).toBe("csharp");
    expect(suggestIconSlug("C++")).toBe("cplusplus");
  });
});
