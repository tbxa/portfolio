import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

/** Seção da página inicial com âncora e título no estilo "// 02. projetos". */
export function Section({
  id,
  index,
  title,
  description,
  children,
  className,
}: {
  id: string;
  index: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-10 max-w-2xl sm:mb-14">
          <p className="mb-3 font-mono text-xs tracking-wider text-brand uppercase">
            {String(index).padStart(2, "0")} / {title}
          </p>
          <h2 id={`${id}-title`} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {description && <p className="mt-4 text-pretty text-muted-foreground">{description}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
