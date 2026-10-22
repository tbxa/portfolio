"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/public/project-card";
import { TechIcon } from "@/components/shared/tech-icon";
import { cn } from "@/lib/utils";
import type { ProjectCardData, Technology } from "@/types";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProjectsShowcase({ projects }: { projects: ProjectCardData[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [tech, setTech] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sort: number; count: number }>();
    for (const p of projects) {
      if (!p.category) continue;
      const entry = map.get(p.category.id) ?? { id: p.category.id, name: p.category.name, sort: p.category.sort_order, count: 0 };
      entry.count++;
      map.set(p.category.id, entry);
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [projects]);

  const technologies = useMemo(() => {
    const map = new Map<string, Technology & { count: number }>();
    for (const p of projects) {
      for (const t of p.technologies) {
        const entry = map.get(t.id) ?? { ...t, count: 0 };
        entry.count++;
        map.set(t.id, entry);
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));
  }, [projects]);

  const filtered = projects.filter(
    (p) =>
      (!category || p.category?.id === category) && (!tech || p.technologies.some((t) => t.id === tech))
  );

  return (
    <div>
      <div className="mb-8 space-y-4">
        {categories.length > 1 && (
          <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
            {[{ id: null, name: "Todos", count: projects.length }, ...categories].map((c) => {
              const selected = category === c.id;
              return (
                <button
                  key={c.id ?? "all"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    chip,
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {c.name}
                  <span className={cn("font-mono text-xs", selected ? "opacity-70" : "opacity-60")}>{c.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {technologies.length > 1 && (
          <div role="group" aria-label="Filtrar por tecnologia" className="flex flex-wrap gap-1.5">
            {technologies.map((t) => {
              const selected = tech === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTech(selected ? null : t.id)}
                  className={cn(
                    chip,
                    "px-2.5 py-1 text-xs",
                    selected
                      ? "border-brand bg-brand/10 text-foreground"
                      : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  <TechIcon name={t.name} icon={t.icon} className="size-3" />
                  {t.name}
                </button>
              );
            })}
            {tech && (
              <button
                type="button"
                onClick={() => setTech(null)}
                className={cn(chip, "border-transparent px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground")}
              >
                <XIcon className="size-3" aria-hidden="true" /> Limpar
              </button>
            )}
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "projeto encontrado" : "projetos encontrados"}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Nenhum projeto com esses filtros.
        </p>
      ) : (
        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project, i) => (
              <motion.li
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectCard project={project} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
