/** "Meu Projeto — Ação!" → "meu-projeto-acao" */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Retorna `base`, ou `base-2`, `base-3`… o primeiro que não estiver em `taken`. */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const root = base || "item";
  if (!used.has(root)) return root;
  for (let i = 2; ; i++) {
    const candidate = `${root}-${i}`;
    if (!used.has(candidate)) return candidate;
  }
}

/** Palpite de slug do Simple Icons a partir do nome ("Next.js" → "nextdotjs"). */
export function suggestIconSlug(name: string) {
  const compact = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.js$/, "dotjs")
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp");
  return compact.replace(/[^a-z0-9]/g, "");
}
