import { Section } from "@/components/public/section";
import { Reveal } from "@/components/shared/reveal";
import { TechIcon } from "@/components/shared/tech-icon";
import type { SkillGroup } from "@/types";

export function Skills({ index, groups }: { index: number; groups: SkillGroup[] }) {
  return (
    <Section
      id="tecnologias"
      index={index}
      title="Tecnologias"
      description="Ferramentas e tecnologias que utilizo no desenvolvimento dos meus projetos."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.map((group, i) => (
          <Reveal key={group.category?.id ?? "outros"} delay={i * 0.05}>
            <div className="h-full rounded-xl border bg-card/50 p-5">
              <h3 className="mb-4 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {group.category?.name ?? "Outros"}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.technologies.map((tech) => (
                  <li
                    key={tech.id}
                    className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm transition-colors hover:border-foreground/20"
                  >
                    <TechIcon name={tech.name} icon={tech.icon} />
                    {tech.name}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
