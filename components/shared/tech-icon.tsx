"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Slug do Simple Icons → URL do CDN; URL https é usada como está. */
export function techIconUrl(icon: string) {
  if (!icon) return null;
  if (icon.startsWith("https://")) return icon;
  return `https://cdn.simpleicons.org/${encodeURIComponent(icon)}`;
}

function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/**
 * Ícone monocromático (máscara CSS + currentColor): combina com o tema claro
 * e escuro. Sem ícone, ou se ele não carregar, mostra as iniciais.
 */
export function TechIcon({
  name,
  icon,
  className,
}: {
  name: string;
  icon: string;
  className?: string;
}) {
  const src = techIconUrl(icon);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    const probe = new Image();
    probe.onerror = () => setFailedSrc(src);
    probe.src = src;
    return () => {
      probe.onerror = null;
    };
  }, [src]);

  if (!src || failedSrc === src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center font-mono text-[0.55em] leading-none font-semibold",
          className
        )}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-4 shrink-0 bg-current", className)}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
