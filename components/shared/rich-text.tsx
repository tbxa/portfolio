import { cn } from "@/lib/utils";

type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };

const BULLET = /^\s*[-*•]\s+/;

/** Texto livre → parágrafos (separados por linha em branco) e listas ("- item"). */
function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.trim().split(/\n\s*\n/)) {
    const lines = chunk.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length && lines.every((l) => BULLET.test(l))) {
      blocks.push({ type: "ul", items: lines.map((l) => l.replace(BULLET, "").trim()) });
    } else if (lines.length) {
      blocks.push({ type: "p", text: lines.join("\n") });
    }
  }
  return blocks;
}

/** Renderiza texto do painel com segurança (sem HTML injetado). */
export function RichText({ text, className }: { text: string; className?: string }) {
  if (!text.trim()) return null;
  return (
    <div className={cn("space-y-4 leading-relaxed text-muted-foreground", className)}>
      {parse(text).map((block, i) =>
        block.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-brand">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}
