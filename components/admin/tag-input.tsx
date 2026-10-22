"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

/** Lista de palavras curtas (interesses, palavras-chave). Enter ou vírgula adiciona. */
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tags = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !value.some((v) => v.toLowerCase() === t.toLowerCase()));
    if (tags.length) onChange([...value, ...tags]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag} className="inline-flex items-center gap-1 rounded-md border bg-muted/50 py-0.5 pr-1 pl-2 text-xs">
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== tag))}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Remover ${tag}`}
              >
                <XIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
