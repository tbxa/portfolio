const monthYear = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const fullDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2024-03-01" → "mar. de 2024" */
export function formatMonthYear(date: string | null | undefined) {
  if (!date) return "";
  return monthYear.format(new Date(date));
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "";
  return fullDate.format(new Date(date));
}

export function formatPeriod(start: string | null, end: string | null, isCurrent: boolean) {
  const from = formatMonthYear(start);
  const to = isCurrent ? "atual" : formatMonthYear(end);
  if (from && to) return `${from} — ${to}`;
  return from || to;
}

/** Divide um texto livre em linhas não vazias, removendo marcadores ("- ", "• "). */
export function toLines(text: string | null | undefined) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

/** Apenas dígitos, para links wa.me. */
export function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** "https://www.linkedin.com/in/fulano/" → "linkedin.com/in/fulano" */
export function displayUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "") + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}
