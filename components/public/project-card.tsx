import { ArrowUpRightIcon, ImageIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GitHubIcon } from "@/components/shared/brand-icons";
import { TechIcon } from "@/components/shared/tech-icon";
import { buttonVariants } from "@/components/ui/button";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { ProjectCardData } from "@/types";

const MAX_TECHS = 6;

export function ProjectCard({ project, priority }: { project: ProjectCardData; priority?: boolean }) {
  const cover = storageUrl(project.cover_path);
  const detailsHref = `/projetos/${project.slug}`;
  const extraTechs = project.technologies.length - MAX_TECHS;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/20">
      <Link
        href={detailsHref}
        className="relative block aspect-[16/10] overflow-hidden border-b bg-muted"
        tabIndex={-1}
        aria-hidden="true"
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
        {project.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium backdrop-blur">
            <StarIcon className="size-3 fill-brand text-brand" aria-hidden="true" /> Destaque
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          {project.category && <span>{project.category.name}</span>}
          {project.category && project.year && <span aria-hidden="true">·</span>}
          {project.year && <span>{project.year}</span>}
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          <Link href={detailsHref} className="outline-none hover:underline focus-visible:underline">
            {project.name}
          </Link>
        </h3>
        {project.short_description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {project.short_description}
          </p>
        )}

        {project.technologies.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tecnologias utilizadas">
            {project.technologies.slice(0, MAX_TECHS).map((tech) => (
              <li
                key={tech.id}
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs"
              >
                <TechIcon name={tech.name} icon={tech.icon} className="size-3" />
                {tech.name}
              </li>
            ))}
            {extraTechs > 0 && (
              <li className="rounded-md px-2 py-1 text-xs text-muted-foreground">+{extraTechs}</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {project.site_url && (
            <a
              href={project.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }))}
              aria-label={`Ver projeto ${project.name} (abre em nova aba)`}
            >
              Ver projeto
              <ArrowUpRightIcon data-icon="inline-end" />
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              aria-label={`Código-fonte de ${project.name} no GitHub (abre em nova aba)`}
            >
              <GitHubIcon data-icon="inline-start" className="size-3.5" />
              Código-fonte
            </a>
          )}
          <Link
            href={detailsHref}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            aria-label={`Detalhes técnicos de ${project.name}`}
          >
            Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
