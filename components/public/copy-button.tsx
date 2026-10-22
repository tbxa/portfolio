"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sem permissão de área de transferência: o link continua funcionando.
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={copied ? "Copiado" : label} className={className}>
      {copied ? <CheckIcon className="text-brand" /> : <CopyIcon />}
    </Button>
  );
}
